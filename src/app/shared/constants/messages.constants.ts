/**
 * UI messages constants
 * Centralized messages for notifications and dialogs
 */

export const MESSAGES = {
  SUCCESS: {
    CREATE: 'Creado exitosamente',
    UPDATE: 'Actualizado exitosamente',
    DELETE: 'Eliminado exitosamente',
    SAVE: 'Guardado exitosamente',
    PAYMENT: 'Pago registrado exitosamente',
  },
  ERROR: {
    GENERIC: 'Ocurrió un error inesperado',
    NETWORK: 'Error de conexión. Verifique su internet.',
    NOT_FOUND: 'El recurso solicitado no fue encontrado',
    UNAUTHORIZED: 'No tiene permisos para realizar esta acción',
    VALIDATION: 'Por favor, corrija los errores en el formulario',
    SERVER: 'Error en el servidor. Intente nuevamente.',
  },
  CONFIRM: {
    DELETE: '¿Está seguro que desea eliminar este registro?',
    CANCEL: '¿Está seguro que desea cancelar? Los cambios no guardados se perderán.',
    DAR_BAJA: '¿Está seguro que desea dar de baja a esta persona? El saldo se transferirá a la caja de grupo.',
  },
  LOADING: {
    DEFAULT: 'Cargando...',
    SAVING: 'Guardando...',
    DELETING: 'Eliminando...',
  },
  EMPTY: {
    PERSONAS: 'No hay personas registradas',
    MOVIMIENTOS: 'No hay movimientos registrados',
    CAMPAMENTOS: 'No hay campamentos registrados',
    EVENTOS: 'No hay eventos registrados',
    INSCRIPCIONES: 'No hay inscripciones registradas',
    CUOTAS: 'No hay cuotas registradas',
  },
} as const;

/**
 * Validation messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es obligatorio',
  MIN_LENGTH: (min: number) => `Debe tener al menos ${min} caracteres`,
  MAX_LENGTH: (max: number) => `No puede exceder ${max} caracteres`,
  EMAIL: 'Ingrese un email válido',
  PHONE: 'Ingrese un teléfono válido',
  POSITIVE_NUMBER: 'El valor debe ser mayor a 0',
  DATE_FUTURE: 'La fecha no puede ser en el pasado',
  DATE_PAST: 'La fecha no puede ser en el futuro',
} as const;
