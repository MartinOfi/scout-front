/**
 * Caja models
 * Typed interfaces - NO any
 */

import { CajaType } from '../enums';

/**
 * Propietario info returned from API
 */
export interface CajaPropietario {
  id: string;
  nombre: string;
}

/**
 * Caja base (financial account)
 */
export interface Caja {
  id: string;
  tipo: CajaType;
  nombre: string | null;
  propietarioId: string | null;
  propietario: CajaPropietario | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Caja response from API with calculated saldoActual
 * Matches CajaResponseDto from backend
 */
export interface CajaConSaldo extends Caja {
  saldoActual: number;
}

/**
 * Caja summary for dashboard
 */
export interface CajaSummary {
  id: string;
  tipo: CajaType;
  nombre: string;
  saldoActual: number;
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
