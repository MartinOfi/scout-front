/**
 * Pago Campamento Model
 * Registro de pagos realizados para campamentos
 */

import { MedioPagoEnum } from '../enums';

export interface PagoCampamento {
  id: string;
  participanteCampamentoId: string;
  montoTotal: number;
  montoDesdeCuentaPersonal: number;
  montoEfectivo: number;
  fecha: Date;
  medioPago: MedioPagoEnum;
  movimientoId: string;
}

export interface PagoCampamentoDto {
  montoTotal: number;
  montoDesdeCuentaPersonal: number;
  montoEfectivo: number;
  medioPago: MedioPagoEnum;
}
