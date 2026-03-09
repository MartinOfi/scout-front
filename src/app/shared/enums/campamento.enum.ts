/**
 * Campamento-related enums
 * Mirrors backend: src/common/enums/index.ts
 */

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
