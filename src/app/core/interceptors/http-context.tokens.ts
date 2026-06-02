import { HttpContextToken } from '@angular/common/http';

/**
 * Cuando está en true en el HttpContext de un request, el errorInterceptor NO
 * muestra el snackbar global de error (el componente maneja el error por su
 * cuenta). El error igual se propaga al caller.
 *
 * Caso de uso: el reporte público devuelve 404 cuando el evento no es público;
 * ahí queremos mostrar un cartel "no disponible" en la página, sin un toast
 * global de "Recurso no encontrado".
 */
export const SKIP_GLOBAL_ERROR = new HttpContextToken<boolean>(() => false);
