/**
 * Auth Guard
 * Protects routes that require authentication
 * Uses TokenService for token validation
 */

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../../modules/auth/services';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  // Check if we have a valid access token
  if (tokenService.isAccessTokenValid()) {
    return true;
  }

  // Access token expired/invalid - check if we can refresh
  if (tokenService.isRefreshTokenValid()) {
    // Let the interceptor handle the refresh on the first API call
    // The token is expired but refreshable, so allow navigation
    return true;
  }

  // No valid tokens - redirect to login
  // Store the attempted URL for redirect after login
  const currentUrl = window.location.pathname + window.location.search;
  if (currentUrl !== '/login' && currentUrl !== '/') {
    sessionStorage.setItem('redirectUrl', currentUrl);
  }

  router.navigate(['/login']);
  return false;
};

/**
 * Guard for routes that should only be accessible when NOT authenticated
 * (e.g., login page - redirect to dashboard if already logged in)
 */
export const noAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  // If user has valid tokens, redirect to dashboard
  if (tokenService.isAccessTokenValid() || tokenService.isRefreshTokenValid()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
