/**
 * Campamento-related enums
 * Mirrors backend: src/common/enums/index.ts
 */

/**
 * Filters for movements in campamento detail
 * - TODOS: all movements (income + all egress, includes USO_SALDO_PERSONAL)
 * - INGRESOS: only participant payments (campamento_pago)
 * - EGRESOS: all egress movements (campamento_gasto + uso_saldo_personal)
 * - GASTOS: real expenses only (campamento_gasto, excludes uso_saldo_personal)
 */
export enum FiltroMovimientosCampamento {
  TODOS = 'todos',
  INGRESOS = 'ingresos',
  EGRESOS = 'egresos',
  GASTOS = 'gastos',
}

/**
 * Labels for FiltroMovimientosCampamento
 */
export const FILTRO_MOVIMIENTOS_LABELS: Record<FiltroMovimientosCampamento, string> = {
  [FiltroMovimientosCampamento.TODOS]: 'Todos',
  [FiltroMovimientosCampamento.INGRESOS]: 'Ingresos',
  [FiltroMovimientosCampamento.EGRESOS]: 'Egresos',
  [FiltroMovimientosCampamento.GASTOS]: 'Gastos',
} as const;

/**
 * Estado de pago de participante en campamento
 */
export enum EstadoPagoCampamento {
  PENDIENTE = 'pendiente',
  PARCIAL = 'parcial',
  PAGADO = 'pagado',
}

/**
 * Labels for EstadoPagoCampamento
 */
export const ESTADO_PAGO_CAMPAMENTO_LABELS: Record<EstadoPagoCampamento, string> = {
  [EstadoPagoCampamento.PENDIENTE]: 'Pendiente',
  [EstadoPagoCampamento.PARCIAL]: 'Pago Parcial',
  [EstadoPagoCampamento.PAGADO]: 'Pagado',
} as const;
