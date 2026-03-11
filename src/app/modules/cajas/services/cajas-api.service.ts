import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  Caja,
  CajaConSaldo,
  CreateCajaDto,
  Movimiento,
  SaldoCajaResponse,
} from '../../../shared/models';
import { HttpService } from '../../../shared/services';
import { API_CONFIG } from '../../../shared/constants';
import { CajaType } from '../../../shared/enums';

/**
 * API service for Cajas module
 * Uses correct endpoints from API_REFERENCE.md:
 * - GET /cajas - List all cajas (with optional tipo query param)
 * - GET /cajas/grupo - Get caja de grupo
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
   * Get saldo of a caja by its ID
   * Endpoint: GET /movimientos/saldo/:cajaId
   */
  getSaldo(cajaId: string): Observable<SaldoCajaResponse> {
    return this.http.get<SaldoCajaResponse>(
      `${API_CONFIG.ENDPOINTS.MOVIMIENTOS_SALDO}/${cajaId}`
    );
  }

  /**
   * Get movimientos of a caja by its ID
   * Endpoint: GET /movimientos/caja/:cajaId
   */
  getMovimientos(cajaId: string): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(
      `${API_CONFIG.ENDPOINTS.MOVIMIENTOS_CAJA}/${cajaId}`
    );
  }

  /**
   * Create a new caja
   */
  create(dto: CreateCajaDto): Observable<Caja> {
    return this.http.post<Caja, CreateCajaDto>(this.endpoint, dto);
  }

  /**
   * Get saldo de cuenta personal by personaId
   * Fetches personal cajas and finds the one matching the propietarioId
   * Returns 0 if no personal account found
   */
  getSaldoCuentaPersonal(personaId: string): Observable<number> {
    return this.getByType(CajaType.PERSONAL).pipe(
      map((cajas: Caja[]) => cajas.find((c) => c.propietarioId === personaId)),
      switchMap((caja: Caja | undefined) => {
        if (!caja) {
          return of(0);
        }
        return this.getSaldo(caja.id).pipe(map((res) => res.saldo));
      })
    );
  }
}
