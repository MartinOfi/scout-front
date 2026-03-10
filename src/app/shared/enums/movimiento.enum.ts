/**
 * Movimiento-related enums
 * Mirrors backend: src/common/enums/index.ts
 */

/**
 * Types of movements (income/expense)
 */
export const TIPOS_MOVIMIENTO = ['ingreso', 'egreso'] as const;
export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number];

export enum TipoMovimientoEnum {
  INGRESO = 'ingreso',
  EGRESO = 'egreso',
}

/**
 * Concepts of movements (15 total)
 * Synced with backend: src/common/enums/index.ts
 */
export enum ConceptoMovimiento {
  // Inscripciones
  INSCRIPCION_GRUPO = 'inscripcion_grupo',
  INSCRIPCION_SCOUT_ARGENTINA = 'inscripcion_scout_argentina',
  INSCRIPCION_PAGO_SCOUT_ARGENTINA = 'inscripcion_pago_scout_argentina',

  // Cuotas
  CUOTA_GRUPO = 'cuota_grupo',

  // Campamentos
  CAMPAMENTO_PAGO = 'campamento_pago',
  CAMPAMENTO_GASTO = 'campamento_gasto',

  // Eventos de venta
  EVENTO_VENTA_INGRESO = 'evento_venta_ingreso',
  EVENTO_VENTA_GASTO = 'evento_venta_gasto',

  // Eventos de grupo
  EVENTO_GRUPO_INGRESO = 'evento_grupo_ingreso',
  EVENTO_GRUPO_GASTO = 'evento_grupo_gasto',

  // Gastos generales
  GASTO_GENERAL = 'gasto_general',

  // Reembolsos
  REEMBOLSO = 'reembolso',

  // Ajustes
  AJUSTE_INICIAL = 'ajuste_inicial',

  // Fondos de rama
  ASIGNACION_FONDO_RAMA = 'asignacion_fondo_rama',

  // Transferencias internas
  TRANSFERENCIA_BAJA = 'transferencia_baja',
}

/**
 * Labels for ConceptoMovimiento (for UI display)
 */
export const CONCEPTO_MOVIMIENTO_LABELS: Record<ConceptoMovimiento, string> = {
  [ConceptoMovimiento.INSCRIPCION_GRUPO]: 'Inscripción de Grupo',
  [ConceptoMovimiento.INSCRIPCION_SCOUT_ARGENTINA]: 'Inscripción Scout Argentina',
  [ConceptoMovimiento.INSCRIPCION_PAGO_SCOUT_ARGENTINA]: 'Pago a Scout Argentina',
  [ConceptoMovimiento.CUOTA_GRUPO]: 'Cuota de Grupo',
  [ConceptoMovimiento.CAMPAMENTO_PAGO]: 'Pago de Campamento',
  [ConceptoMovimiento.CAMPAMENTO_GASTO]: 'Gasto de Campamento',
  [ConceptoMovimiento.EVENTO_VENTA_INGRESO]: 'Ingreso Evento de Venta',
  [ConceptoMovimiento.EVENTO_VENTA_GASTO]: 'Gasto Evento de Venta',
  [ConceptoMovimiento.EVENTO_GRUPO_INGRESO]: 'Ingreso Evento de Grupo',
  [ConceptoMovimiento.EVENTO_GRUPO_GASTO]: 'Gasto Evento de Grupo',
  [ConceptoMovimiento.GASTO_GENERAL]: 'Gasto General',
  [ConceptoMovimiento.REEMBOLSO]: 'Reembolso',
  [ConceptoMovimiento.AJUSTE_INICIAL]: 'Ajuste Inicial',
  [ConceptoMovimiento.ASIGNACION_FONDO_RAMA]: 'Asignación a Fondo de Rama',
  [ConceptoMovimiento.TRANSFERENCIA_BAJA]: 'Transferencia por Baja',
} as const;

/**
 * Payment methods
 */
export const MEDIOS_PAGO = ['efectivo', 'transferencia'] as const;
export type MedioPago = (typeof MEDIOS_PAGO)[number];

export enum MedioPagoEnum {
  EFECTIVO = 'efectivo',
  TRANSFERENCIA = 'transferencia',
}

/**
 * Labels for MedioPago (for UI display)
 */
export const MEDIO_PAGO_LABELS: Record<MedioPago, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
} as const;

/**
 * Payment status
 */
export enum EstadoPago {
  PAGADO = 'pagado',
  PENDIENTE_REEMBOLSO = 'pendiente_reembolso',
}

/**
 * Labels for EstadoPago
 */
export const ESTADO_PAGO_LABELS: Record<EstadoPago, string> = {
  [EstadoPago.PAGADO]: 'Pagado',
  [EstadoPago.PENDIENTE_REEMBOLSO]: 'Pendiente de Reembolso',
} as const;
