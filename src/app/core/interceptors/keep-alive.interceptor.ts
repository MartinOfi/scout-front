import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeepAliveService, IS_KEEP_ALIVE } from '../services/keep-alive.service';

/**
 * Resets the keep-alive timer on every outgoing HTTP request,
 * so the backend ping only fires after 14 min of real inactivity.
 * Skips keep-alive pings themselves to avoid resetting the timer in a loop.
 */
export const keepAliveInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.context.get(IS_KEEP_ALIVE)) {
    inject(KeepAliveService).notifyActivity();
  }
  return next(req);
};
