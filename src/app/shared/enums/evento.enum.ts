/**
 * Evento-related enums
 * Mirrors backend: src/common/enums/index.ts
 */

/**
 * Types of events
 */
export enum TipoEvento {
  VENTA = 'venta',
  GRUPO = 'grupo',
}

/**
 * Labels for TipoEvento
 */
export const TIPO_EVENTO_LABELS: Record<TipoEvento, string> = {
  [TipoEvento.VENTA]: 'Evento de Venta',
  [TipoEvento.GRUPO]: 'Evento de Grupo',
} as const;

/**
 * Destination of event profits (for sale events)
 */
export enum DestinoGanancia {
  CUENTAS_PERSONALES = 'cuentas_personales',
  CAJA_GRUPO = 'caja_grupo',
}

/**
 * Labels for DestinoGanancia
 */
export const DESTINO_GANANCIA_LABELS: Record<DestinoGanancia, string> = {
  [DestinoGanancia.CUENTAS_PERSONALES]: 'Cuentas Personales',
  [DestinoGanancia.CAJA_GRUPO]: 'Caja de Grupo',
} as const;
