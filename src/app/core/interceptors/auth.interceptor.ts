/**
 * Auth Interceptor
 * Handles JWT token management for HTTP requests:
 * - Adds Bearer token to authenticated requests
 * - Handles 401 errors with transparent token refresh
 * - Queues requests during refresh to prevent race conditions
 */

import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthStateService } from '../../modules/auth/services';
import { API_CONFIG } from '../../shared/constants';

/**
 * Endpoints that should NOT have auth token added
 * These are public endpoints or endpoints that handle their own auth
 */
const AUTH_ENDPOINTS = [
  API_CONFIG.ENDPOINTS.AUTH_LOGIN,
  API_CONFIG.ENDPOINTS.AUTH_REGISTER,
  API_CONFIG.ENDPOINTS.AUTH_REFRESH,
];

/**
 * Subject to track refresh state and queue pending requests
 */
let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthStateService);

  // Skip adding token for auth endpoints
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  // Add token if available
  const token = authState.getAccessToken();
  if (token) {
    req = addTokenToRequest(req, token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 errors for authenticated requests
      if (error.status === 401 && token) {
        return handle401Error(req, next, authState);
      }
      return throwError(() => error);
    }),
  );
};

/**
 * Check if URL is an auth endpoint (should skip token addition)
 */
function isAuthEndpoint(url: string): boolean {
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

/**
 * Clone request with Authorization header
 */
function addTokenToRequest(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Handle 401 Unauthorized error
 * Attempts to refresh token and retry the request
 */
function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authState: AuthStateService,
): Observable<HttpEvent<unknown>> {
  // If not already refreshing, start refresh
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null); // Reset subject for queued requests

    return authState.refreshSession().pipe(
      switchMap((response) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);

        // Retry original request with new token
        return next(addTokenToRequest(req, response.accessToken));
      }),
      catchError((error) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);

        // Refresh failed - logout and propagate error
        authState.logout();
        return throwError(() => error);
      }),
    );
  }

  // If already refreshing, wait for refresh to complete then retry
  return refreshTokenSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((token) => next(addTokenToRequest(req, token!))),
  );
}
