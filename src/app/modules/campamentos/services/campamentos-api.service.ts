import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Campamento,
  CampamentoDetalleDto,
  CreateCampamentoDto,
  UpdateCampamentoDto,
  AddParticipanteDto,
  UpdateParticipanteAutorizacionDto,
  RegistrarPagoCampamentoDto,
  RegistrarGastoCampamentoDto,
  UpdatePagoDto,
  ResultadoPagoDto,
  PagoParticipante,
} from '../../../shared/models';
import { HttpService } from '../../../shared/services';
import { API_CONFIG } from '../../../shared/constants';
import { FiltroMovimientos } from '../../../shared/enums';

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
   * Get consolidated campamento detail
   * Includes: campamento info, participantes with payment status, filtered movements, and KPIs
   * KPIs are always calculated over all movements regardless of filter
   */
  getDetalle(
    id: string,
    filtro: FiltroMovimientos = FiltroMovimientos.TODOS,
    participantesFilter?: { nombre?: string; rama?: string },
  ): Observable<CampamentoDetalleDto> {
    const params: Record<string, string> = { filtroMovimientos: filtro };
    if (participantesFilter?.nombre) params['nombre'] = participantesFilter.nombre;
    if (participantesFilter?.rama) params['rama'] = participantesFilter.rama;
    return this.http.get<CampamentoDetalleDto>(`${this.endpoint}/${id}/detalle`, params);
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

  updateParticipanteAutorizacion(
    campamentoId: string,
    personaId: string,
    dto: UpdateParticipanteAutorizacionDto,
  ): Observable<void> {
    return this.http.patch<void, UpdateParticipanteAutorizacionDto>(
      `${this.endpoint}/${campamentoId}/participantes/${personaId}`,
      dto,
    );
  }

  /**
   * Fijar el monto bonificado de un participante contra el fondo solidario.
   * Recibe el monto total deseado (no un delta).
   */
  bonificarParticipante(campamentoId: string, personaId: string, monto: number): Observable<void> {
    return this.http.patch<void, { monto: number }>(
      `${this.endpoint}/${campamentoId}/participantes/${personaId}/bonificacion`,
      { monto },
    );
  }

  /**
   * Quitar la bonificación de un participante
   */
  quitarBonificacionParticipante(campamentoId: string, personaId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.endpoint}/${campamentoId}/participantes/${personaId}/bonificacion`,
    );
  }

  /**
   * Register a payment for campamento
   * POST /api/v1/campamentos/:id/pagos/:personaId
   * Supports mixed payments (cash/transfer + personal account balance)
   */
  registrarPago(
    campamentoId: string,
    personaId: string,
    dto: RegistrarPagoCampamentoDto,
  ): Observable<ResultadoPagoDto> {
    return this.http.post<ResultadoPagoDto, RegistrarPagoCampamentoDto>(
      `${this.endpoint}/${campamentoId}/pagos/${personaId}`,
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
