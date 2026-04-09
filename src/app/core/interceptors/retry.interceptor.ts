/**
 * Retry Interceptor
 *
 * Automatically retries HTTP requests that fail due to transient errors
 * (Render free tier gateway issues, temporary network problems).
 *
 * Retry policy:
 * - GET requests: retry on 502, 503, 504, and status 0 (network error when online)
 * - POST/PATCH/DELETE: retry ONLY on 503 and status 0 (server definitely didn't process)
 * - Never retry on business errors (400, 401, 403, 404, 422, 500)
 * - Never retry auth/refresh (handled by auth interceptor)
 * - Skip retry when navigator.onLine is false (user is offline)
 *
 * Uses exponential backoff with jitter to avoid thundering herd.
 */

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, retry, throwError, timer } from 'rxjs';

import { HTTP_CONFIG } from '../../shared/constants/api.constants';

const SAFE_RETRY_STATUSES = [503] as const;
const ALL_TRANSIENT_STATUSES = [502, 503, 504] as const;
const NETWORK_ERROR_STATUS = 0;

const EXCLUDED_URL_PATTERNS = ['auth/refresh'] as const;

function isExcludedUrl(url: string): boolean {
  return EXCLUDED_URL_PATTERNS.some((pattern) => url.includes(pattern));
}

function isTransientError(status: number, method: string): boolean {
  if (status === NETWORK_ERROR_STATUS) {
    return navigator.onLine;
  }

  const isReadOnly = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';

  if (isReadOnly) {
    return (ALL_TRANSIENT_STATUSES as readonly number[]).includes(status);
  }

  return (SAFE_RETRY_STATUSES as readonly number[]).includes(status);
}

function calculateBackoffDelay(attempt: number): number {
  const exponentialDelay = HTTP_CONFIG.RETRY_DELAY * Math.pow(2, attempt);
  const jitter = Math.random() * 300;
  return exponentialDelay + jitter;
}

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  if (isExcludedUrl(req.url)) {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: HTTP_CONFIG.RETRY_ATTEMPTS,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (!isTransientError(error.status, req.method)) {
          return throwError(() => error);
        }

        const delayMs = calculateBackoffDelay(retryCount - 1);
        console.warn(
          `[RetryInterceptor] ${req.method} ${req.url} failed (${error.status}). Retry ${retryCount}/${HTTP_CONFIG.RETRY_ATTEMPTS} in ${Math.round(delayMs)}ms`,
        );

        return timer(delayMs);
      },
    }),
  );
};
