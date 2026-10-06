/**
 * Inscripcion related enums
 * Mirrors backend: src/common/enums/index.ts
 */

/**
 * Inscription types
 */
export type TipoInscripcion = 'grupo' | 'scout_argentina';

/**
 * Labels for TipoInscripcion
 */
export const TIPO_INSCRIPCION_LABELS: Record<TipoInscripcion, string> = {
  grupo: 'Grupo',
  scout_argentina: 'Scout Argentina',
} as const;

/**
 * Inscription states (calculated from payments)
 * Synced with backend: EstadoInscripcion enum
 */
export type EstadoInscripcion = 'pendiente' | 'parcial' | 'pagado' | 'bonificado';

/**
 * Labels for EstadoInscripcion
 */
export const ESTADO_INSCRIPCION_LABELS: Record<EstadoInscripcion, string> = {
  pendiente: 'Pendiente',
  parcial: 'Pago Parcial',
  pagado: 'Pagado',
  bonificado: 'Bonificado',
} as const;
