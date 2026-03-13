/**
 * Campamento models
 * Typed interfaces - NO any
 */

import { Persona } from './persona.model';
import { Movimiento } from './movimiento.model';
import { MedioPago, EstadoPago } from '../enums';

/**
 * Campamento (Camp/trip)
 */
export interface Campamento {
  id: string;
  nombre: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin: Date;
  costoPorPersona: number;
  cuotasBase?: number; // Suggested number of payments
  participantes?: Persona[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Campamento with financial summary
 */
export interface CampamentoConResumen extends Campamento {
  totalEsperado: number;
  totalRecaudado: number;
  totalGastado: number;
  saldo: number;
}

/**
 * Payment tracking per participant
 */
export interface PagoParticipante {
  participanteId: string;
  participanteNombre: string;
  costoPorPersona: number;
  totalPagado: number;
  saldoPendiente: number;
  pagos: PagoDetalle[];
}

/**
 * Individual payment detail
 */
export interface PagoDetalle {
  movimientoId: string;
  fecha: Date;
  monto: number;
  medioPago: MedioPago;
  descripcion?: string;
}

/**
 * DTO for creating a campamento
 */
export interface CreateCampamentoDto {
  nombre: string;
  descripcion?: string;
  fechaInicio: string; // ISO date string
  fechaFin: string; // ISO date string
  costoPorPersona: number;
  cuotasBase?: number;
}

/**
 * DTO for updating a campamento
 */
export interface UpdateCampamentoDto {
  nombre?: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  costoPorPersona?: number;
  cuotasBase?: number;
}

/**
 * DTO for adding a participant
 */
export interface AddParticipanteDto {
  personaId: string;
}

/**
 * DTO for registering a payment
 */
export interface RegistrarPagoCampamentoDto {
  personaId: string;
  monto: number;
  medioPago: MedioPago;
  descripcion?: string;
}

/**
 * DTO for registering an expense
 */
export interface RegistrarGastoCampamentoDto {
  monto: number;
  descripcion: string;
  responsableId: string;
  medioPago: MedioPago;
  estadoPago: EstadoPago;
  personaAReembolsarId?: string;
}
