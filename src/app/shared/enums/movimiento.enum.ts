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
  TRANSFERENCIA_ENTRE_CAJAS = 'transferencia_entre_cajas',

  // Uso de saldo personal (egreso de cuenta personal)
  USO_SALDO_PERSONAL = 'uso_saldo_personal',
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
  [ConceptoMovimiento.TRANSFERENCIA_ENTRE_CAJAS]: 'Transferencia entre Cajas',
  [ConceptoMovimiento.USO_SALDO_PERSONAL]: 'Uso de Saldo Personal',
} as const;

/**
 * Payment methods
 */
export const MEDIOS_PAGO = ['efectivo', 'transferencia', 'saldo_personal', 'mixto'] as const;
export type MedioPago = (typeof MEDIOS_PAGO)[number];

export enum MedioPagoEnum {
  EFECTIVO = 'efectivo',
  TRANSFERENCIA = 'transferencia',
  SALDO_PERSONAL = 'saldo_personal',
  MIXTO = 'mixto',
}

/**
 * Labels for MedioPago (for UI display)
 */
export const MEDIO_PAGO_LABELS: Record<MedioPago, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  saldo_personal: 'Saldo Personal',
  mixto: 'Mixto',
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

/**
 * Whitelist of concepts that can be created manually via the individual form.
 * All other concepts are system-generated from events/camps/inscripciones/cuotas.
 */
export const CONCEPTOS_CREABLES_MANUALMENTE: readonly ConceptoMovimiento[] = [
  ConceptoMovimiento.GASTO_GENERAL,
  ConceptoMovimiento.AJUSTE_INICIAL,
] as const;

/**
 * Category of movement — orthogonal axis to concepto, used for reports.
 */
export enum CategoriaMovimiento {
  INSUMOS = 'insumos',
  COMIDA = 'comida',
  TRANSPORTE = 'transporte',
  ALQUILER = 'alquiler',
  SERVICIOS = 'servicios',
  MATERIAL_DIDACTICO = 'material_didactico',
  MANTENIMIENTO = 'mantenimiento',
  OTROS = 'otros',
}

export const CATEGORIA_MOVIMIENTO_LABELS: Record<CategoriaMovimiento, string> = {
  [CategoriaMovimiento.INSUMOS]: 'Insumos',
  [CategoriaMovimiento.COMIDA]: 'Comida',
  [CategoriaMovimiento.TRANSPORTE]: 'Transporte',
  [CategoriaMovimiento.ALQUILER]: 'Alquiler',
  [CategoriaMovimiento.SERVICIOS]: 'Servicios',
  [CategoriaMovimiento.MATERIAL_DIDACTICO]: 'Material Didáctico',
  [CategoriaMovimiento.MANTENIMIENTO]: 'Mantenimiento',
  [CategoriaMovimiento.OTROS]: 'Otros',
} as const;
