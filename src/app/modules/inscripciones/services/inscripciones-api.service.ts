import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Inscripcion,
  InscripcionConEstado,
  CreateInscripcionDto,
  UpdateInscripcionDto,
} from '../../../shared/models';
import { TipoInscripcion } from '../../../shared/enums';
import { HttpService } from '../../../shared/services';
import { API_CONFIG } from '../../../shared/constants';

/**
 * Query params for listing inscripciones
 */
export interface InscripcionesQueryParams {
  ano?: number;
  tipo?: TipoInscripcion;
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
    return this.http.get<Inscripcion[]>(this.endpoint, queryParams);
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
    return this.http.post<Inscripcion, CreateInscripcionDto>(
      this.endpoint,
      dto
    );
  }

  /**
   * Update an inscripcion (PATCH)
   * Use to update authorization fields or montoBonificado
   */
  update(id: string, dto: UpdateInscripcionDto): Observable<Inscripcion> {
    return this.http.patch<Inscripcion, UpdateInscripcionDto>(
      `${this.endpoint}/${id}`,
      dto
    );
  }

  /**
   * Delete an inscripcion
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
