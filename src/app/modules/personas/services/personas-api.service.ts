import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Persona,
  CreateProtagonistaDto,
  CreateEducadorDto,
  CreatePersonaExternaDto,
  UpdatePersonaDto,
  PersonaUnion,
} from '../../../shared/models';
import { HttpService } from '../../../shared/services';
import { API_CONFIG } from '../../../shared/constants';

/**
 * API service for Personas module
 * SIN any - all methods are typed
 */
@Injectable({
  providedIn: 'root',
})
export class PersonasApiService {
  private readonly http = inject(HttpService);
  private readonly endpoint = API_CONFIG.ENDPOINTS.PERSONAS;
  private readonly endpointProtagonistas = API_CONFIG.ENDPOINTS.PROTAGONISTAS;
  private readonly endpointEducadores = API_CONFIG.ENDPOINTS.EDUCADORES;
  private readonly endpointPersonasExternas = API_CONFIG.ENDPOINTS.PERSONAS_EXTERNAS;

  /**
   * Get all active personas
   */
  getAll(): Observable<PersonaUnion[]> {
    return this.http.get<PersonaUnion[]>(this.endpoint);
  }

  /**
   * Get persona by ID
   */
  getById(id: string): Observable<PersonaUnion> {
    return this.http.get<PersonaUnion>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new protagonista
   */
  createProtagonista(dto: CreateProtagonistaDto): Observable<Persona> {
    return this.http.post<Persona, CreateProtagonistaDto>(this.endpointProtagonistas, dto);
  }

  /**
   * Create a new educador
   */
  createEducador(dto: CreateEducadorDto): Observable<Persona> {
    return this.http.post<Persona, CreateEducadorDto>(this.endpointEducadores, dto);
  }

  /**
   * Create a new persona externa
   */
  createPersonaExterna(dto: CreatePersonaExternaDto): Observable<Persona> {
    return this.http.post<Persona, CreatePersonaExternaDto>(this.endpointPersonasExternas, dto);
  }

  /**
   * Update a persona (PATCH)
   */
  update(id: string, dto: UpdatePersonaDto): Observable<PersonaUnion> {
    return this.http.patch<PersonaUnion, UpdatePersonaDto>(
      `${this.endpoint}/${id}`,
      dto
    );
  }

  /**
   * Delete a persona (soft delete)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Get personas with pending debts (including inactive)
   */
  getConDeudas(): Observable<PersonaUnion[]> {
    return this.http.get<PersonaUnion[]>(
      API_CONFIG.ENDPOINTS.PERSONAS_CON_DEUDAS
    );
  }

  /**
   * Deactivate a persona (dar de baja)
   * Transfers personal account balance to group account
   */
  darDeBaja(id: string): Observable<{ saldoTransferido: number }> {
    return this.http.post<{ saldoTransferido: number }, null>(
      `${this.endpoint}/${id}/dar-de-baja`,
      null
    );
  }
}
