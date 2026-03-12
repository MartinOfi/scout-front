/**
 * Pago Inscripción Model
 * Registro de pagos realizados para inscripciones
 */

import { MedioPago, MedioPagoEnum } from '../enums';

export interface PagoInscripcion {
  id: string;
  inscripcionId: string;
  monto: number;
  fecha: Date;
  medioPago: MedioPagoEnum;
  movimientoId: string;
}

/**
 * DTO for registering a subsequent payment on an inscription
 * POST /api/v1/inscripciones/:id/pagar
 */
export interface PagoInscripcionDto {
  montoPagado: number;
  montoConSaldoPersonal?: number;
  medioPago?: MedioPago;
  descripcion?: string;
}

/**
 * Existing payment data for edit mode in dialog
 */
export interface ExistingPago {
  movimientoId: string;
  monto: number;
  medioPago: MedioPago;
  descripcion: string | null;
  fecha: string;
}

/**
 * DTO for updating an existing payment
 * PATCH /api/v1/movimientos/:id
 */
export interface UpdatePagoDto {
  monto?: number;
  medioPago?: MedioPago;
  descripcion?: string;
}
