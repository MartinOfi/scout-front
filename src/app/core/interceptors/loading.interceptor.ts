/**
 * Loading Interceptor
 * Muestra/oculta indicador de carga global
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

// TODO: Implementar servicio de loading global
let activeRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  activeRequests++;
  // TODO: Mostrar spinner de carga
  
  return next(req).pipe(
    finalize(() => {
      activeRequests--;
      if (activeRequests === 0) {
        // TODO: Ocultar spinner de carga
      }
    })
  );
};
