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
}

/**
 * Labels for EstadoPagoCampamento
 */
export const ESTADO_PAGO_CAMPAMENTO_LABELS: Record<EstadoPagoCampamento, string> = {
  [EstadoPagoCampamento.PENDIENTE]: 'Pendiente',
  [EstadoPagoCampamento.PARCIAL]: 'Pago Parcial',
  [EstadoPagoCampamento.PAGADO]: 'Pagado',
} as const;
