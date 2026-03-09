/**
 * Movimiento models
 * Typed interfaces - NO any
 */

import {
  TipoMovimientoEnum,
  ConceptoMovimiento,
  MedioPago,
  EstadoPago,
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
 */
export interface UpdateMovimientoDto {
  descripcion?: string;
  comprobanteEntregado?: boolean;
  estadoPago?: EstadoPago;
}

/**
 * Filters for movimientos list
 */
export interface MovimientosFilters {
  cajaId?: string;
  tipo?: TipoMovimientoEnum;
  concepto?: ConceptoMovimiento;
  responsableId?: string;
  estadoPago?: EstadoPago;
  fechaInicio?: string;
  fechaFin?: string;
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
