import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { retryInterceptor } from './retry.interceptor';
import { HTTP_CONFIG } from '../../shared/constants/api.constants';

describe('retryInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([retryInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  /**
   * Helper: flush an error response and advance fake timers for the next retry.
   * The backoff formula is: RETRY_DELAY * 2^attempt + jitter
   * We advance slightly more than the max possible delay to be safe.
   */
  function flushErrorAndAdvance(
    url: string,
    status: number,
    attempt: number,
    useProgressEvent = false,
  ): void {
    const req = httpMock.expectOne(url);
    if (useProgressEvent) {
      req.error(new ProgressEvent('error'), { status, statusText: 'Unknown Error' });
    } else {
      req.flush('error', { status, statusText: 'Server Error' });
    }
    // Advance past the exponential backoff delay + max jitter (300ms)
    const maxDelay = HTTP_CONFIG.RETRY_DELAY * Math.pow(2, attempt) + 300;
    vi.advanceTimersByTime(maxDelay);
  }

  // ─── GET requests: retry on all transient errors (502, 503, 504, 0) ───

  describe('GET requests', () => {
    const TRANSIENT_STATUSES = [502, 503, 504];

    TRANSIENT_STATUSES.forEach((status) => {
      it(`should retry GET on ${status} up to ${HTTP_CONFIG.RETRY_ATTEMPTS} times then fail`, async () => {
        const promise = firstValueFrom(http.get('/api/test')).catch((err) => err);

        // Initial request + RETRY_ATTEMPTS retries
        for (let i = 0; i <= HTTP_CONFIG.RETRY_ATTEMPTS; i++) {
          flushErrorAndAdvance('/api/test', status, i);
        }

        const err: HttpErrorResponse = await promise;
        expect(err.status).toBe(status);
      });
    });

    it('should retry GET on network error (status 0) when online', async () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

      const promise = firstValueFrom(http.get('/api/test')).catch((err) => err);

      for (let i = 0; i <= HTTP_CONFIG.RETRY_ATTEMPTS; i++) {
        flushErrorAndAdvance('/api/test', 0, i, true);
      }

      const err: HttpErrorResponse = await promise;
      expect(err.status).toBe(0);
    });

    it('should succeed on retry if server recovers', async () => {
      const promise = firstValueFrom(http.get<{ ok: boolean }>('/api/test'));

      // First request: fail with 503
      flushErrorAndAdvance('/api/test', 503, 0);

      // Second request (retry): succeed
      const req2 = httpMock.expectOne('/api/test');
      req2.flush({ ok: true });

      const res = await promise;
      expect(res.ok).toBe(true);
    });
  });

  // ─── POST/PATCH/DELETE: only retry on 503 and status 0 ───

  describe('mutating requests (POST, PATCH, DELETE)', () => {
    it('should retry POST on 503', async () => {
      const promise = firstValueFrom(http.post<{ ok: boolean }>('/api/test', {}));

      flushErrorAndAdvance('/api/test', 503, 0);

      const req2 = httpMock.expectOne('/api/test');
      expect(req2.request.method).toBe('POST');
      req2.flush({ ok: true });

      const res = await promise;
      expect(res.ok).toBe(true);
    });

    it('should retry PATCH on status 0 when online', async () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

      const promise = firstValueFrom(http.patch<{ ok: boolean }>('/api/test', {}));

      flushErrorAndAdvance('/api/test', 0, 0, true);

      const req2 = httpMock.expectOne('/api/test');
      expect(req2.request.method).toBe('PATCH');
      req2.flush({ ok: true });

      const res = await promise;
      expect(res.ok).toBe(true);
    });

    it('should NOT retry POST on 502 (server may have processed)', async () => {
      const promise = firstValueFrom(http.post('/api/test', {})).catch((err) => err);

      const req = httpMock.expectOne('/api/test');
      req.flush('error', { status: 502, statusText: 'Bad Gateway' });

      const err: HttpErrorResponse = await promise;
      expect(err.status).toBe(502);

      // No retry — no pending requests
      httpMock.expectNone('/api/test');
    });

    it('should NOT retry DELETE on 504', async () => {
      const promise = firstValueFrom(http.delete('/api/test')).catch((err) => err);

      const req = httpMock.expectOne('/api/test');
      req.flush('error', { status: 504, statusText: 'Gateway Timeout' });

      const err: HttpErrorResponse = await promise;
      expect(err.status).toBe(504);

      httpMock.expectNone('/api/test');
    });

    it('should NOT retry PATCH on 502', async () => {
      const promise = firstValueFrom(http.patch('/api/test', {})).catch((err) => err);

      const req = httpMock.expectOne('/api/test');
      req.flush('error', { status: 502, statusText: 'Bad Gateway' });

      const err: HttpErrorResponse = await promise;
      expect(err.status).toBe(502);

      httpMock.expectNone('/api/test');
    });
  });

  // ─── Non-retryable errors: never retry ───

  describe('non-retryable errors', () => {
    const NON_RETRYABLE = [400, 401, 403, 404, 409, 422, 500];

    NON_RETRYABLE.forEach((status) => {
      it(`should NOT retry on ${status}`, async () => {
        const promise = firstValueFrom(http.get('/api/test')).catch((err) => err);

        const req = httpMock.expectOne('/api/test');
        req.flush('error', { status, statusText: 'Error' });

        const err: HttpErrorResponse = await promise;
        expect(err.status).toBe(status);

        httpMock.expectNone('/api/test');
      });
    });
  });

  // ─── Offline detection: skip retry when offline ───

  describe('offline detection', () => {
    it('should NOT retry when navigator.onLine is false (status 0)', async () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

      const promise = firstValueFrom(http.get('/api/test')).catch((err) => err);

      const req = httpMock.expectOne('/api/test');
      req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

      const err: HttpErrorResponse = await promise;
      expect(err.status).toBe(0);

      httpMock.expectNone('/api/test');
    });
  });

  // ─── Auth endpoint exclusion ───

  describe('auth endpoint exclusion', () => {
    it('should NOT retry auth/refresh endpoint on 503', async () => {
      const promise = firstValueFrom(http.get('/api/v1/auth/refresh')).catch((err) => err);

      const req = httpMock.expectOne('/api/v1/auth/refresh');
      req.flush('error', { status: 503, statusText: 'Service Unavailable' });

      const err: HttpErrorResponse = await promise;
      expect(err.status).toBe(503);

      httpMock.expectNone('/api/v1/auth/refresh');
    });

    it('should retry auth/login on 503 (login is idempotent)', async () => {
      const promise = firstValueFrom(
        http.post<{ token: string }>('/api/v1/auth/login', { user: 'test' }),
      );

      // Login is POST so only retries on 503
      flushErrorAndAdvance('/api/v1/auth/login', 503, 0);

      const req2 = httpMock.expectOne('/api/v1/auth/login');
      req2.flush({ token: 'abc' });

      const res = await promise;
      expect(res.token).toBe('abc');
    });
  });
});
