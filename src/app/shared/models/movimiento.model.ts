/**
 * Movimiento models
 * Typed interfaces - NO any
 */

import {
  TipoMovimientoEnum,
  ConceptoMovimiento,
  MedioPago,
  EstadoPago,
  CategoriaMovimiento,
} from '../enums';
import { Persona } from './persona.model';
import { Caja } from './caja.model';

/**
 * Movimiento (financial transaction)
 */
export interface Movimiento {
  id: string;
  cajaId: string;
  caja?: Caja;
  tipo: TipoMovimientoEnum;
  monto: number;
  concepto: ConceptoMovimiento;
  categoria?: CategoriaMovimiento;
  descripcion?: string;
  responsableId: string;
  responsable?: Persona;
  medioPago: MedioPago;
  requiereComprobante: boolean;
  comprobanteEntregado?: boolean;
  estadoPago: EstadoPago;
  personaAReembolsarId?: string;
  personaAReembolsar?: Persona;
  fecha: Date;
  eventoId?: string;
  campamentoId?: string;
  inscripcionId?: string;
  cuotaId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a movimiento
 */
export interface CreateMovimientoDto {
  cajaId: string;
  tipo: TipoMovimientoEnum;
  monto: number;
  concepto: ConceptoMovimiento;
  categoria?: CategoriaMovimiento;
  descripcion?: string;
  responsableId: string;
  medioPago: MedioPago;
  requiereComprobante?: boolean;
  estadoPago: EstadoPago;
  personaAReembolsarId?: string;
  fecha?: string; // ISO date string
  eventoId?: string;
  campamentoId?: string;
  inscripcionId?: string;
  cuotaId?: string;
}

/**
 * DTO for updating a movimiento
 * Backend: PATCH /movimientos/:id
 */
export interface UpdateMovimientoDto {
  monto?: number;
  descripcion?: string;
  medioPago?: MedioPago;
  requiereComprobante?: boolean;
  comprobanteEntregado?: boolean;
  estadoPago?: EstadoPago;
  personaAReembolsarId?: string;
  fecha?: string;
}

/**
 * Filters for movimientos list
 */
export interface MovimientosFilters {
  cajaId?: string;
  /** Comma-separated CajaType values for filtering by multiple caja types */
  tipoCaja?: string;
  tipo?: TipoMovimientoEnum;
  concepto?: ConceptoMovimiento;
  categoria?: CategoriaMovimiento;
  responsableId?: string;
  estadoPago?: EstadoPago;
  fechaInicio?: string;
  fechaFin?: string;
}

/**
 * DTO for creating a transferencia between two cajas.
 * Creates two linked movimientos (egreso in origen, ingreso in destino).
 */
export interface CreateTransferenciaDto {
  cajaOrigenId: string;
  cajaDestinoId: string;
  monto: number;
  responsableId: string;
  descripcion?: string;
  fecha?: string;
}

/**
 * Response of a transferencia creation — the two linked movimientos.
 */
export interface TransferenciaResult {
  egreso: Movimiento;
  ingreso: Movimiento;
}

/**
 * Reembolso pendiente summary
 */
export interface ReembolsoPendiente {
  personaId: string;
  personaNombre: string;
  totalPendiente: number;
  movimientos: Movimiento[];
}
