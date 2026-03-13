/**
 * Consolidado Saldos Response Model
 * Response from GET /cajas/consolidado
 * Provides all financial balances and debts in a single response
 */

/**
 * Detail of a single rama fund
 */
export interface FondoRamaDetalle {
  readonly tipo: 'RAMA_MANADA' | 'RAMA_UNIDAD' | 'RAMA_CAMINANTES' | 'RAMA_ROVERS';
  readonly id: string;
  readonly nombre: string;
  readonly saldo: number;
}

/**
 * Summary of all rama funds
 */
export interface FondosRamaConsolidado {
  readonly total: number;
  readonly detalle: readonly FondoRamaDetalle[];
}

/**
 * Summary of personal accounts
 */
export interface CuentasPersonalesConsolidado {
  readonly total: number;
  readonly cantidad: number;
}

/**
 * Summary of pending reimbursements
 */
export interface ReembolsosPendientesConsolidado {
  readonly total: number;
  readonly cantidad: number;
}

/**
 * Detail of debt by category
 */
export interface DeudaCategoriaConsolidado {
  readonly total: number;
  readonly cantidad: number;
}

/**
 * Summary of all debts
 */
export interface DeudasTotalesConsolidado {
  readonly total: number;
  readonly inscripciones: DeudaCategoriaConsolidado;
  readonly cuotas: DeudaCategoriaConsolidado;
  readonly campamentos: DeudaCategoriaConsolidado;
}

/**
 * Financial summary totals
 */
export interface ResumenConsolidado {
  readonly totalGeneral: number;
  readonly totalDisponible: number;
  readonly totalPorCobrar: number;
}

/**
 * Group account info
 */
export interface CajaGrupoConsolidado {
  readonly id: string;
  readonly saldo: number;
}

/**
 * Full consolidated response from GET /cajas/consolidado
 */
export interface ConsolidadoSaldosResponse {
  readonly fecha: string;
  readonly resumen: ResumenConsolidado;
  readonly cajaGrupo: CajaGrupoConsolidado;
  readonly fondosRama: FondosRamaConsolidado;
  readonly cuentasPersonales: CuentasPersonalesConsolidado;
  readonly reembolsosPendientes: ReembolsosPendientesConsolidado;
  readonly deudasTotales: DeudasTotalesConsolidado;
}
