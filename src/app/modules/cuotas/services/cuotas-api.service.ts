import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Cuota, CreateCuotaDto, UpdateCuotaDto } from '../../../shared/models';
import { HttpService } from '../../../shared/services';
import { API_CONFIG } from '../../../shared/constants';

/**
 * API service for Cuotas module
 * SIN any - all methods are typed
 */
@Injectable({
  providedIn: 'root',
})
export class CuotasApiService {
  private readonly http = inject(HttpService);
  private readonly endpoint = API_CONFIG.ENDPOINTS.CUOTAS;

  /**
   * Get all cuotas
   */
  getAll(): Observable<Cuota[]> {
    return this.http.get<Cuota[]>(this.endpoint);
  }

  /**
   * Get cuota by ID
   */
  getById(id: string): Observable<Cuota> {
    return this.http.get<Cuota>(`${this.endpoint}/${id}`);
  }

  /**
   * Get cuotas by persona
   */
  getByPersona(personaId: string): Observable<Cuota[]> {
    return this.http.get<Cuota[]>(this.endpoint, { personaId });
  }

  /**
   * Create a new cuota
   * PRD F9: Cuota de Grupo
   */
  create(dto: CreateCuotaDto): Observable<Cuota> {
    return this.http.post<Cuota, CreateCuotaDto>(this.endpoint, dto);
  }

  /**
   * Update a cuota (PATCH)
   */
  update(id: string, dto: UpdateCuotaDto): Observable<Cuota> {
    return this.http.patch<Cuota, UpdateCuotaDto>(
      `${this.endpoint}/${id}`,
      dto
    );
  }

  /**
   * Register a payment for cuota
   */
  registrarPago(
    cuotaId: string,
    monto: number,
    medioPago: string
  ): Observable<Cuota> {
    return this.http.post<Cuota, { monto: number; medioPago: string }>(
      `${this.endpoint}/${cuotaId}/pagar`,
      {
        monto,
        medioPago,
      }
    );
  }
}
