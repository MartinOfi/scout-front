/**
 * Cuota models
 * Typed interfaces - NO any
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
  numero: number; // Cuota number (1, 2, 3, etc.)
  ano: number;
  montoTotal: number;
  montoPagado: number;
  estado: EstadoCuota;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a cuota
 */
export interface CreateCuotaDto {
  personaId: string;
  numero: number;
  ano: number;
  montoTotal: number;
}

/**
 * DTO for updating a cuota
 */
export interface UpdateCuotaDto {
  montoPagado?: number;
  estado?: EstadoCuota;
}
