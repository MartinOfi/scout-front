/**
 * Cuota models
 * Typed interfaces - NO any
 * Synced with backend API: docs/API_REFERENCE.md
 */

import { EstadoCuota } from '../enums';
import { Persona } from './persona.model';

/**
 * Cuota (Group quota)
 */
export interface Cuota {
  id: string;
  personaId: string;
  persona?: Persona;
  nombre: string;
  ano: number;
  montoTotal: number;
  montoPagado: number;
  estado: EstadoCuota;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a cuota
 * Backend: POST /cuotas
 */
export interface CreateCuotaDto {
  personaId: string;
  nombre: string;
  ano: number;
  montoTotal: number;
}

/**
 * DTO for registering payment
 * Backend: POST /cuotas/:id/pago
 */
export interface PagoCuotaDto {
  monto: number;
  medioPago: string;
  responsableId: string;
}

/**
 * DTO for updating a cuota
 * Note: Backend doesn't have explicit update endpoint for cuota fields,
 * payments are handled via POST /cuotas/:id/pago
 * This is kept for internal state management only
 */
export interface UpdateCuotaDto {
  montoPagado?: number;
  estado?: string;
}
