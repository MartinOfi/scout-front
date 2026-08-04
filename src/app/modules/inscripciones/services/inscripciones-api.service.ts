import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  Inscripcion,
  InscripcionConEstado,
  CreateInscripcionDto,
  UpdateInscripcionDto,
  PagoInscripcionDto,
  UpdatePagoDto,
  BonificarInscripcionDto,
  TipoDeuda,
  InscripcionesConsolidado,
} from '../../../shared/models';
import { PersonaType, RamaEnum, TipoInscripcion } from '../../../shared/enums';
import { HttpService } from '../../../shared/services';
import { API_CONFIG } from '../../../shared/constants';

/**
 * Rama filter type for inscripciones
 * Includes scout branches (protagonistas) + educadores
 */
export type RamaFilter = RamaEnum | typeof PersonaType.EDUCADOR;

/**
 * Query params for listing inscripciones
 */
export interface InscripcionesQueryParams {
  ano?: number;
  tipo?: TipoInscripcion;
  tipoDeuda?: TipoDeuda;
  rama?: RamaFilter;
}

/**
 * API service for Inscripciones module
 * SIN any - all methods are typed
 */
@Injectable({
  providedIn: 'root',
})
export class InscripcionesApiService {
  private readonly http = inject(HttpService);
  private readonly endpoint = API_CONFIG.ENDPOINTS.INSCRIPCIONES;
  private readonly movimientosEndpoint = API_CONFIG.ENDPOINTS.MOVIMIENTOS;

  /**
   * Get all inscripciones with optional filters
   */
  getAll(params?: InscripcionesQueryParams): Observable<Inscripcion[]> {
    const queryParams: Record<string, string> = {};
    if (params?.ano) {
      queryParams['ano'] = params.ano.toString();
    }
    if (params?.tipo) {
      queryParams['tipo'] = params.tipo;
    }
    if (params?.tipoDeuda) {
      queryParams['tipoDeuda'] = params.tipoDeuda;
    }
    if (params?.rama) {
      queryParams['rama'] = params.rama;
    }
    return this.http.get<Inscripcion[]>(this.endpoint, queryParams);
  }

  /**
   * Get consolidado data with aggregated stats and debtors breakdown
   * GET /api/v1/inscripciones/consolidado
   */
  getConsolidado(params?: InscripcionesQueryParams): Observable<InscripcionesConsolidado> {
    const queryParams: Record<string, string> = {};
    if (params?.ano) {
      queryParams['ano'] = params.ano.toString();
    }
    if (params?.tipo) {
      queryParams['tipo'] = params.tipo;
    }
    if (params?.tipoDeuda) {
      queryParams['tipoDeuda'] = params.tipoDeuda;
    }
    if (params?.rama) {
      queryParams['rama'] = params.rama;
    }
    return this.http.get<InscripcionesConsolidado>(`${this.endpoint}/consolidado`, queryParams);
  }

  /**
   * Get inscripcion by ID with calculated payment state
   */
  getById(id: string): Observable<InscripcionConEstado> {
    return this.http.get<InscripcionConEstado>(`${this.endpoint}/${id}`);
  }

  /**
   * Get inscripciones by persona
   */
  getByPersona(personaId: string): Observable<Inscripcion[]> {
    return this.http.get<Inscripcion[]>(`${this.endpoint}/persona/${personaId}`);
  }

  /**
   * Create a new inscripcion
   */
  create(dto: CreateInscripcionDto): Observable<Inscripcion> {
    return this.http.post<Inscripcion, CreateInscripcionDto>(this.endpoint, dto);
  }

  /**
   * Update an inscripcion (PATCH)
   * Use to update authorization fields
   */
  update(id: string, dto: UpdateInscripcionDto): Observable<Inscripcion> {
    return this.http.patch<Inscripcion, UpdateInscripcionDto>(`${this.endpoint}/${id}`, dto);
  }

  /**
   * Delete an inscripcion
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Register a subsequent payment for an inscription
   * POST /api/v1/inscripciones/:id/pagar
   */
  pagarInscripcion(id: string, dto: PagoInscripcionDto): Observable<InscripcionConEstado> {
    return this.http.post<InscripcionConEstado, PagoInscripcionDto>(
      `${this.endpoint}/${id}/pagar`,
      dto,
    );
  }

  /**
   * Update an existing payment (movimiento)
   * Uses PATCH /api/v1/movimientos/:id then refreshes inscripcion state
   */
  updatePago(
    inscripcionId: string,
    movimientoId: string,
    dto: UpdatePagoDto,
  ): Observable<InscripcionConEstado> {
    return this.http
      .patch<unknown, UpdatePagoDto>(`${this.movimientosEndpoint}/${movimientoId}`, dto)
      .pipe(switchMap(() => this.getById(inscripcionId)));
  }

  /**
   * Delete an existing payment (movimiento)
   * Uses DELETE /api/v1/movimientos/:id then refreshes inscripcion state
   */
  deletePago(inscripcionId: string, movimientoId: string): Observable<InscripcionConEstado> {
    return this.http
      .delete<void>(`${this.movimientosEndpoint}/${movimientoId}`)
      .pipe(switchMap(() => this.getById(inscripcionId)));
  }

  /**
   * Fijar el monto bonificado, financiado por el fondo solidario
   * PATCH /api/v1/inscripciones/:id/bonificacion
   */
  bonificar(id: string, monto: number): Observable<InscripcionConEstado> {
    return this.http.patch<InscripcionConEstado, BonificarInscripcionDto>(
      `${this.endpoint}/${id}/bonificacion`,
      { monto },
    );
  }

  /**
   * Quitar la bonificación de una inscripción
   * DELETE /api/v1/inscripciones/:id/bonificacion
   */
  quitarBonificacion(id: string): Observable<InscripcionConEstado> {
    return this.http.delete<InscripcionConEstado>(`${this.endpoint}/${id}/bonificacion`);
  }
}
