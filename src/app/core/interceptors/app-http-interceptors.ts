import { HttpInterceptorFn } from '@angular/common/http';

import { authInterceptor } from './auth.interceptor';
import { errorInterceptor } from './error.interceptor';
import { keepAliveInterceptor } from './keep-alive.interceptor';
import { retryInterceptor } from './retry.interceptor';

/**
 * Orden de interceptors HTTP de la app (el primero es el más externo).
 * errorInterceptor va ANTES que authInterceptor para ver solo el resultado
 * final: un 401 por token vencido que se resuelve con refresh no debe
 * mostrar "No autorizado" al usuario.
 */
export const APP_HTTP_INTERCEPTORS: HttpInterceptorFn[] = [
  keepAliveInterceptor, // Resets keep-alive timer on every request
  errorInterceptor, // Handles errors globally (after refresh and retries)
  authInterceptor, // Adds auth token and refreshes on 401
  retryInterceptor, // Retries transient errors (502/503/504) with exponential backoff
];
