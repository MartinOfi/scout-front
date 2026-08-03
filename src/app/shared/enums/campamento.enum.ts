/**
 * Campamento-related enums
 * Mirrors backend: src/common/enums/index.ts
 */

// El filtro de movimientos (Todos/Ingresos/Egresos/Gastos) es común a
// campamentos y eventos: vive en `movimiento.enum.ts` como `FiltroMovimientos`.

/**
 * Estado de pago de participante en campamento
 */
export enum EstadoPagoCampamento {
  PENDIENTE = 'pendiente',
  PARCIAL = 'parcial',
  PAGADO = 'pagado',
  /** Monto asignado 0: no se espera pago (típicamente educadores) */
  EXENTO = 'exento',
}

/**
 * Labels for EstadoPagoCampamento
 */
export const ESTADO_PAGO_CAMPAMENTO_LABELS: Record<EstadoPagoCampamento, string> = {
  [EstadoPagoCampamento.PENDIENTE]: 'Pendiente',
  [EstadoPagoCampamento.PARCIAL]: 'Pago Parcial',
  [EstadoPagoCampamento.PAGADO]: 'Pagado',
  [EstadoPagoCampamento.EXENTO]: 'Exento',
} as const;
