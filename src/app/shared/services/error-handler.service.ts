/**
 * Error Handler Service
 * Centralized error handling with user-friendly messages
 * SIN any - fully typed
 */

import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NotificationService } from './notification.service';

/**
 * Error handler service
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private readonly notification = inject(NotificationService);

  /**
   * Get user-friendly error message from HttpErrorResponse
   */
  getErrorMessage(error: HttpErrorResponse): string {
    // Backend error message
    if (error.error?.message) {
      return error.error.message;
    }

    // Status code based messages
    switch (error.status) {
      case 400:
        return 'Error en los datos enviados. Verifique los campos.';
      case 401:
        return 'No autorizado. Inicie sesión nuevamente.';
      case 403:
        return 'No tiene permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 409:
        return 'Conflicto con los datos existentes.';
      case 422:
        return 'Datos inválidos. Verifique la información.';
      case 500:
        return 'Error del servidor. Intente más tarde.';
      case 503:
        return 'Servicio no disponible. Intente más tarde.';
      case 0:
        return 'No se pudo conectar con el servidor. Verifique su conexión.';
      default:
        return 'Ocurrió un error inesperado.';
    }
  }

  /**
   * Handle HTTP error and show notification
   * Returns error observable for catchError operator
   */
  handleError<T>(operation = 'operation'): (error: HttpErrorResponse) => Observable<never> {
    return (error: HttpErrorResponse): Observable<never> => {
      const message = this.getErrorMessage(error);
      this.notification.showError(message);
      console.error(`${operation} failed:`, error);
      return throwError(() => error);
    };
  }

  /**
   * Handle error without showing notification (for silent failures)
   */
  handleErrorSilent<T>(operation = 'operation'): (error: HttpErrorResponse) => Observable<never> {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => error);
    };
  }
}
