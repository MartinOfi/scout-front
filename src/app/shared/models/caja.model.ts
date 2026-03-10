/**
 * Caja models
 * Typed interfaces - NO any
 */

import { CajaType } from '../enums';
import { Persona } from './persona.model';

/**
 * Caja (financial account)
 */
export interface Caja {
  id: string;
  tipo: CajaType;
  nombre?: string;
  propietarioId?: string;
  propietario?: Persona;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Caja with calculated saldo
 */
export interface CajaConSaldo extends Caja {
  saldo: number;
}

/**
 * Caja summary for dashboard
 */
export interface CajaSummary {
  id: string;
  tipo: CajaType;
  nombre: string;
  saldo: number;
}

/**
 * DTO for creating a caja
 */
export interface CreateCajaDto {
  tipo: CajaType;
  nombre?: string;
  propietarioId?: string;
}

/**
 * Response from GET /movimientos/saldo/:cajaId
 */
export interface SaldoCajaResponse {
  cajaId: string;
  saldo: number;
}
