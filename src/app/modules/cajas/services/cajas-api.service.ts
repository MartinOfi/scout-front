import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Caja, CajaConSaldo, CreateCajaDto, Movimiento } from '../../../shared/models';
import { HttpService } from '../../../shared/services';
import { API_CONFIG } from '../../../shared/constants';
import { CajaType } from '../../../shared/enums';

/**
 * API service for Cajas module
 * SIN any - all methods are typed
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
   * Get caja by ID with calculated saldo
   */
  getById(id: string): Observable<CajaConSaldo> {
    return this.http.get<CajaConSaldo>(`${this.endpoint}/${id}`);
  }

  /**
   * Get caja de grupo with saldo
   */
  getCajaGrupo(): Observable<CajaConSaldo> {
    return this.http.get<CajaConSaldo>(`${this.endpoint}/grupo`);
  }

  /**
   * Get saldo of caja de grupo
   */
  getSaldoGrupo(): Observable<{ saldo: number }> {
    return this.http.get<{ saldo: number }>(
      `${API_CONFIG.ENDPOINTS.CAJAS_GRUPO}/saldo`
    );
  }

  /**
   * Get movimientos of caja de grupo
   */
  getMovimientosGrupo(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(
      `${API_CONFIG.ENDPOINTS.CAJAS_GRUPO}/movimientos`
    );
  }

  /**
   * Get saldo of a rama fund
   */
  getSaldoRama(rama: string): Observable<{ saldo: number }> {
    return this.http.get<{ saldo: number }>(
      `${API_CONFIG.ENDPOINTS.CAJAS_RAMA}/${rama}/saldo`
    );
  }

  /**
   * Get movimientos of a rama fund
   */
  getMovimientosRama(rama: string): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(
      `${API_CONFIG.ENDPOINTS.CAJAS_RAMA}/${rama}/movimientos`
    );
  }

  /**
   * Get saldo of a personal account
   */
  getSaldoPersonal(personaId: string): Observable<{ saldo: number }> {
    return this.http.get<{ saldo: number }>(
      `${API_CONFIG.ENDPOINTS.CAJAS_PERSONAL}/${personaId}/saldo`
    );
  }

  /**
   * Get movimientos of a personal account
   */
  getMovimientosPersonal(personaId: string): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(
      `${API_CONFIG.ENDPOINTS.CAJAS_PERSONAL}/${personaId}/movimientos`
    );
  }

  /**
   * Create a new caja
   */
  create(dto: CreateCajaDto): Observable<Caja> {
    return this.http.post<Caja, CreateCajaDto>(this.endpoint, dto);
  }
}
