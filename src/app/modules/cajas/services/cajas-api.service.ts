import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Caja,
  CajaConSaldo,
  ConsolidadoSaldosResponse,
  CreateCajaDto,
  Movimiento,
  SaldoCajaResponse,
} from '../../../shared/models';
import { HttpService } from '../../../shared/services';
import { API_CONFIG } from '../../../shared/constants';
import { CajaType } from '../../../shared/enums';

/**
 * API service for Cajas module
 * Endpoints:
 * - GET /cajas - List all cajas (with optional tipo query param)
 * - GET /cajas/grupo - Get caja de grupo
 * - GET /cajas/consolidado - Get consolidated balances
 * - GET /cajas/personal/:personaId/saldo - Get saldo de cuenta personal
 * - GET /cajas/:id - Get caja by ID
 * - GET /movimientos/saldo/:cajaId - Get saldo of a caja
 * - GET /movimientos/caja/:cajaId - Get movimientos of a caja
 */
@Injectable({
  providedIn: 'root',
})
export class CajasApiService {
  private readonly http = inject(HttpService);
  private readonly endpoint = API_CONFIG.ENDPOINTS.CAJAS;

  /**
   * Get all cajas
   */
  getAll(): Observable<CajaConSaldo[]> {
    return this.http.get<CajaConSaldo[]>(this.endpoint);
  }

  /**
   * Get cajas filtered by type
   */
  getByType(tipo: CajaType): Observable<Caja[]> {
    return this.http.get<Caja[]>(`${this.endpoint}?tipo=${tipo}`);
  }

  /**
   * Get personal cajas with optional rama filter
   * rama: 'Manada' | 'Unidad' | 'Caminantes' | 'Rovers' | 'educadores' | undefined
   */
  getPersonales(rama?: string): Observable<CajaConSaldo[]> {
    const params = rama ? `&rama=${encodeURIComponent(rama)}` : '';
    return this.http.get<CajaConSaldo[]>(`${this.endpoint}?tipo=${CajaType.PERSONAL}${params}`);
  }

  /**
   * Get caja by ID
   */
  getById(id: string): Observable<CajaConSaldo> {
    return this.http.get<CajaConSaldo>(`${this.endpoint}/${id}`);
  }

  /**
   * Get caja de grupo
   */
  getCajaGrupo(): Observable<CajaConSaldo> {
    return this.http.get<CajaConSaldo>(API_CONFIG.ENDPOINTS.CAJAS_GRUPO);
  }

  /**
   * Get consolidated financial summary
   * Endpoint: GET /cajas/consolidado
   * Returns all balances and debts in a single response
   */
  getConsolidado(): Observable<ConsolidadoSaldosResponse> {
    return this.http.get<ConsolidadoSaldosResponse>(API_CONFIG.ENDPOINTS.CAJAS_CONSOLIDADO);
  }

  /**
   * Get saldo of a caja by its ID
   * Endpoint: GET /movimientos/saldo/:cajaId
   */
  getSaldo(cajaId: string): Observable<SaldoCajaResponse> {
    return this.http.get<SaldoCajaResponse>(`${API_CONFIG.ENDPOINTS.MOVIMIENTOS_SALDO}/${cajaId}`);
  }

  /**
   * Get movimientos of a caja by its ID
   * Endpoint: GET /movimientos/caja/:cajaId
   */
  getMovimientos(cajaId: string): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${API_CONFIG.ENDPOINTS.MOVIMIENTOS_CAJA}/${cajaId}`);
  }

  /**
   * Create a new caja
   */
  create(dto: CreateCajaDto): Observable<Caja> {
    return this.http.post<Caja, CreateCajaDto>(this.endpoint, dto);
  }

  /**
   * Get saldo de cuenta personal by personaId
   * Single request to backend endpoint
   * Returns 0 if no personal account found
   */
  getSaldoCuentaPersonal(personaId: string): Observable<number> {
    return this.http
      .get<{ saldo: number }>(`${API_CONFIG.ENDPOINTS.CAJAS_PERSONAL_SALDO}/${personaId}/saldo`)
      .pipe(map((res) => res.saldo));
  }

  /**
   * Get la caja de fondo solidario (o null si todavía no fue creada)
   * Endpoint: GET /cajas/fondo-solidario
   * No depende de haber cargado el consolidado antes
   */
  getFondoSolidario(): Observable<{ caja: CajaConSaldo | null }> {
    return this.http.get<{ caja: CajaConSaldo | null }>(API_CONFIG.ENDPOINTS.CAJAS_FONDO_SOLIDARIO);
  }
}
