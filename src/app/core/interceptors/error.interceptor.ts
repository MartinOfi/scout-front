/**
 * Error Interceptor
 * Maneja errores HTTP globalmente
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../../shared/services';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);
  
  return next(req).pipe(
    catchError(error => {
      errorHandler.handleError('HTTP Request')(error).subscribe();
      return throwError(() => error);
    })
  );
};
