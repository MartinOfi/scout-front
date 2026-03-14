/**
 * Inscripcion models
 * Typed interfaces - NO any
 */

import {
  TipoInscripcion,
  EstadoInscripcion,
  MedioPago,
  TipoMovimiento,
  ConceptoMovimiento,
} from '../enums';
import { Persona } from './persona.model';

/**
 * Inscripcion (Scout group or Scout Argentina annual registration)
 * estado and montoPagado are calculated fields, returned by GET endpoints
 */
export interface Inscripcion {
  id: string;
  personaId: string;
  persona?: Persona;
  tipo: TipoInscripcion;
  ano: number;
  montoTotal: number;
  montoBonificado: number;
  declaracionDeSalud: boolean;
  autorizacionDeImagen: boolean;
  salidasCercanas: boolean;
  autorizacionIngreso: boolean;
  createdAt: string;
  updatedAt: string;
  // Calculated fields (returned by backend)
  estado?: EstadoInscripcion;
  montoPagado?: number;
  saldoPendiente?: number;
}

/**
 * Movimiento embedded in inscripcion detail response
 */
export interface MovimientoInscripcion {
  id: string;
  monto: number;
  medioPago: MedioPago;
  fecha: string;
  descripcion: string | null;
  tipo: TipoMovimiento;
  concepto: ConceptoMovimiento;
}

/**
 * Inscripcion with calculated payment state (returned by GET /:id)
 * Flat structure matching backend InscripcionResponseDto
 */
export interface InscripcionConEstado extends Inscripcion {
  estado: EstadoInscripcion;
  montoPagado: number;
  saldoPendiente: number;
  movimientos: MovimientoInscripcion[];
}

/**
 * DTO for creating an inscripcion
 */
export interface CreateInscripcionDto {
  personaId: string;
  tipo: TipoInscripcion;
  ano: number;
  montoTotal: number;
  montoBonificado?: number;
  montoPagado?: number;
  montoConSaldoPersonal?: number;
  medioPago?: MedioPago;
  declaracionDeSalud?: boolean;
  autorizacionDeImagen?: boolean;
  salidasCercanas?: boolean;
  autorizacionIngreso?: boolean;
}

/**
 * DTO for updating an inscripcion
 */
export interface UpdateInscripcionDto {
  montoBonificado?: number;
  declaracionDeSalud?: boolean;
  autorizacionDeImagen?: boolean;
  salidasCercanas?: boolean;
  autorizacionIngreso?: boolean;
}
