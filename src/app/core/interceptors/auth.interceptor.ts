/**
 * Auth Interceptor
 * Agrega token de autenticación a las peticiones HTTP
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: Implementar autenticación real
  const authToken = localStorage.getItem('auth_token');
  
  if (authToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
  }
  
  return next(req);
};
