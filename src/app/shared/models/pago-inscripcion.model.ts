/**
 * Pago Inscripción Model
 * Registro de pagos realizados para inscripciones
 */

import { MedioPagoEnum } from '../enums';

export interface PagoInscripcion {
  id: string;
  inscripcionId: string;
  monto: number;
  fecha: Date;
  medioPago: MedioPagoEnum;
  movimientoId: string;
}

export interface PagoInscripcionDto {
  monto: number;
  medioPago: MedioPagoEnum;
  fecha?: string; // ISO format
}
