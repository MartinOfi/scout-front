/**
 * Error Interceptor
 * Maneja errores HTTP globalmente
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../../shared/services';
import { SKIP_GLOBAL_ERROR } from './http-context.tokens';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((error) => {
      // Requests que optan por manejar el error localmente (ej. reporte
      // público 404) no disparan el snackbar global. El error igual se propaga.
      if (!req.context.get(SKIP_GLOBAL_ERROR)) {
        errorHandler.handleError('HTTP Request')(error).subscribe();
      }
      return throwError(() => error);
    }),
  );
};
