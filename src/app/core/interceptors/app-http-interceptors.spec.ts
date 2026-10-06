import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EMPTY, firstValueFrom, of, throwError } from 'rxjs';

import { APP_HTTP_INTERCEPTORS } from './app-http-interceptors';
import { AuthStateService } from '../../modules/auth/services';
import { ErrorHandlerService } from '../../shared/services';
import { KeepAliveService } from '../services/keep-alive.service';

const URL = '/api/backups/download';
const EXPIRED_TOKEN = 'expired-token';
const FRESH_TOKEN = 'fresh-token';
const UNAUTHORIZED = { status: 401, statusText: 'Unauthorized' };

describe('APP_HTTP_INTERCEPTORS', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let handleErrorSpy: ReturnType<typeof vi.fn<(error: unknown) => void>>;
  let refreshSession: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    handleErrorSpy = vi.fn<(error: unknown) => void>();
    refreshSession = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors(APP_HTTP_INTERCEPTORS)),
        provideHttpClientTesting(),
        {
          provide: AuthStateService,
          useValue: {
            getAccessToken: () => EXPIRED_TOKEN,
            refreshSession,
            logout: vi.fn(),
          },
        },
        {
          provide: ErrorHandlerService,
          useValue: {
            handleError: () => (error: unknown) => {
              handleErrorSpy(error);
              return EMPTY;
            },
          },
        },
        { provide: KeepAliveService, useValue: { notifyActivity: vi.fn() } },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('no muestra error global si el 401 se resuelve refrescando el token', async () => {
    refreshSession.mockReturnValue(of({ accessToken: FRESH_TOKEN }));

    const result = firstValueFrom(http.get(URL));
    httpMock.expectOne(URL).flush(null, UNAUTHORIZED);

    const retried = httpMock.expectOne(URL);
    expect(retried.request.headers.get('Authorization')).toBe(`Bearer ${FRESH_TOKEN}`);
    retried.flush({ ok: true });

    await expect(result).resolves.toEqual({ ok: true });
    expect(handleErrorSpy).not.toHaveBeenCalled();
  });

  it('muestra error global si el refresh también falla', async () => {
    refreshSession.mockReturnValue(throwError(() => UNAUTHORIZED));

    const result = firstValueFrom(http.get(URL));
    httpMock.expectOne(URL).flush(null, UNAUTHORIZED);

    await expect(result).rejects.toBeTruthy();
    expect(handleErrorSpy).toHaveBeenCalledTimes(1);
  });
});
