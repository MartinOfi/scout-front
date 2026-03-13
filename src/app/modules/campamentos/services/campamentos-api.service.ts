import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Campamento,
  CampamentoConResumen,
  PagoParticipante,
  CreateCampamentoDto,
  UpdateCampamentoDto,
  AddParticipanteDto,
  RegistrarPagoCampamentoDto,
  RegistrarGastoCampamentoDto,
  UpdatePagoDto,
} from '../../../shared/models';
import { HttpService } from '../../../shared/services';
import { API_CONFIG } from '../../../shared/constants';

/**
 * API service for Campamentos module
 * SIN any - all methods are typed
 * PRD F12: Campamentos
 */
@Injectable({
  providedIn: 'root',
})
export class CampamentosApiService {
  private readonly http = inject(HttpService);
  private readonly endpoint = API_CONFIG.ENDPOINTS.CAMPAMENTOS;

  /**
   * Get all campamentos
   */
  getAll(): Observable<Campamento[]> {
    return this.http.get<Campamento[]>(this.endpoint);
  }

  /**
   * Get campamento by ID
   */
  getById(id: string): Observable<Campamento> {
    return this.http.get<Campamento>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new campamento
   */
  create(dto: CreateCampamentoDto): Observable<Campamento> {
    return this.http.post<Campamento, CreateCampamentoDto>(this.endpoint, dto);
  }

  /**
   * Update a campamento (PATCH)
   */
  update(id: string, dto: UpdateCampamentoDto): Observable<Campamento> {
    return this.http.patch<Campamento, UpdateCampamentoDto>(`${this.endpoint}/${id}`, dto);
  }

  /**
   * Get financial summary of campamento
   */
  getResumenFinanciero(id: string): Observable<{
    totalEsperado: number;
    totalRecaudado: number;
    totalGastado: number;
    saldo: number;
    participantes: number;
  }> {
    return this.http.get(`${this.endpoint}/${id}/resumen-financiero`);
  }

  /**
   * Get payment tracking per participant
   * PRD F12: Control de pagos por participante
   */
  getPagosPorParticipante(id: string): Observable<PagoParticipante[]> {
    return this.http.get<PagoParticipante[]>(`${this.endpoint}/${id}/pagos-por-participante`);
  }

  /**
   * Add a participant to campamento
   */
  addParticipante(campamentoId: string, dto: AddParticipanteDto): Observable<Campamento> {
    return this.http.post<Campamento, AddParticipanteDto>(
      `${this.endpoint}/${campamentoId}/participantes`,
      dto,
    );
  }

  /**
   * Remove a participant from campamento
   */
  removeParticipante(campamentoId: string, personaId: string): Observable<Campamento> {
    return this.http.delete<Campamento>(
      `${this.endpoint}/${campamentoId}/participantes/${personaId}`,
    );
  }

  /**
   * Register a payment for campamento
   */
  registrarPago(campamentoId: string, dto: RegistrarPagoCampamentoDto): Observable<void> {
    return this.http.post<void, RegistrarPagoCampamentoDto>(
      `${this.endpoint}/${campamentoId}/pagos`,
      dto,
    );
  }

  /**
   * Register an expense for campamento
   */
  registrarGasto(campamentoId: string, dto: RegistrarGastoCampamentoDto): Observable<void> {
    return this.http.post<void, RegistrarGastoCampamentoDto>(
      `${this.endpoint}/${campamentoId}/gastos`,
      dto,
    );
  }

  /**
   * Update an existing payment (movimiento)
   * PATCH /api/v1/campamentos/:id/pagos/:movimientoId
   */
  updatePago(campamentoId: string, movimientoId: string, dto: UpdatePagoDto): Observable<void> {
    return this.http.patch<void, UpdatePagoDto>(
      `${this.endpoint}/${campamentoId}/pagos/${movimientoId}`,
      dto,
    );
  }

  /**
   * Delete an existing payment (movimiento)
   * DELETE /api/v1/campamentos/:id/pagos/:movimientoId
   */
  deletePago(campamentoId: string, movimientoId: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${campamentoId}/pagos/${movimientoId}`);
  }

  /**
   * Delete a campamento (soft delete)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
