/**
 * Campamento models
 * Typed interfaces - NO any
 */

import { Persona } from './persona.model';
import { Movimiento } from './movimiento.model';
import {
  MedioPago,
  EstadoPago,
  TipoMovimiento,
  ConceptoMovimiento,
  PersonaType,
  Rama,
  EstadoPagoCampamento,
} from '../enums';

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
 * POST /api/v1/campamentos/:id/pagos/:personaId
 * Supports mixed payments (cash/transfer + personal account balance)
 */
export interface RegistrarPagoCampamentoDto {
  /** Amount paid in cash/transfer (required, >= 0) */
  montoPagado: number;
  /** Amount to deduct from personal account (optional, default: 0) */
  montoConSaldoPersonal?: number;
  /** Payment method - required if montoPagado > 0 */
  medioPago?: MedioPago;
  /** Optional payment description */
  descripcion?: string;
}

/**
 * Response from payment registration
 */
export interface ResultadoPagoDto {
  movimientoIngreso: {
    id: string;
    monto: number;
    concepto: 'CAMPAMENTO_PAGO';
    medioPago: MedioPago;
  };
  movimientoEgresoPersonal?: {
    id: string;
    monto: number;
  };
  desglose: {
    montoSaldoPersonal: number;
    montoFisico: number;
    total: number;
  };
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
  fecha: string;
  personaAReembolsarId?: string;
}

// ============================================================================
// Consolidated Detail DTOs (GET /campamentos/:id/detalle)
// ============================================================================

/**
 * Campamento info in detail response
 */
export interface CampamentoInfoDto {
  id: string;
  nombre: string;
  fechaInicio: Date;
  fechaFin: Date;
  costoPorPersona: number;
  cuotasBase: number;
  descripcion?: string;
}

/**
 * Individual payment within a participant's history
 */
export interface PagoParticipanteDto {
  movimientoId: string;
  fecha: Date;
  monto: number;
  medioPago: MedioPago;
}

/**
 * Participant with payment status in detail response
 */
export interface ParticipantePagoDto {
  id: string;
  nombre: string;
  tipo: PersonaType;
  rama?: Rama;
  costoPorPersona: number;
  totalPagado: number;
  saldoPendiente: number;
  estadoPago: EstadoPagoCampamento;
  /** Personal account balance available for mixed payments */
  saldoCuentaPersonal: number;
  pagos: PagoParticipanteDto[];
}

/**
 * Movement in campamento detail response
 */
export interface MovimientoCampamentoDto {
  id: string;
  fecha: Date;
  tipo: TipoMovimiento;
  concepto: ConceptoMovimiento;
  monto: number;
  descripcion?: string;
  medioPago: MedioPago;
  estadoPago: EstadoPago;
  responsableId: string;
  responsableNombre: string;
}

/**
 * Financial KPIs for campamento
 */
export interface CampamentoKpisDto {
  totalARecaudar: number;
  totalRecaudado: number;
  totalGastado: number;
  balance: number;
  deudaTotal: number;
  cantidadParticipantes: number;
  participantesPagadosCompleto: number;
  participantesPagadosParcial: number;
  participantesPendientes: number;
}

/**
 * Consolidated campamento detail response
 * GET /api/v1/campamentos/:id/detalle
 */
export interface CampamentoDetalleDto {
  campamento: CampamentoInfoDto;
  participantes: ParticipantePagoDto[];
  movimientos: MovimientoCampamentoDto[];
  kpis: CampamentoKpisDto;
}
