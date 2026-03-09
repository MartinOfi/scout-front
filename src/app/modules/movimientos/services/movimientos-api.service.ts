import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Movimiento,
  CreateMovimientoDto,
  UpdateMovimientoDto,
  MovimientosFilters,
  ReembolsoPendiente,
} from '../../../shared/models';
import { HttpService } from '../../../shared/services';
import { API_CONFIG } from '../../../shared/constants';
import { ConceptoMovimiento, MedioPago, EstadoPago, TipoMovimientoEnum } from '../../../shared/enums';

/**
 * API service for Movimientos module
 * SIN any - all methods are typed
 */
@Injectable({
  providedIn: 'root',
})
export class MovimientosApiService {
  private readonly http = inject(HttpService);
  private readonly endpoint = API_CONFIG.ENDPOINTS.MOVIMIENTOS;

  /**
   * Get all movimientos with optional filters
   */
  getAll(filters?: MovimientosFilters): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(
      this.endpoint,
      filters as Record<string, string | number | boolean> | undefined
    );
  }

  /**
   * Get movimiento by ID
   */
  getById(id: string): Observable<Movimiento> {
    return this.http.get<Movimiento>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new movimiento
   */
  create(dto: CreateMovimientoDto): Observable<Movimiento> {
    return this.http.post<Movimiento, CreateMovimientoDto>(this.endpoint, dto);
  }

  /**
   * Update a movimiento (PATCH)
   */
  update(id: string, dto: UpdateMovimientoDto): Observable<Movimiento> {
    return this.http.patch<Movimiento, UpdateMovimientoDto>(
      `${this.endpoint}/${id}`,
      dto
    );
  }

  /**
   * Delete a movimiento (soft delete)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Get pending reimbursements grouped by person
   * PRD F7: Deudas a personas externas
   */
  getReembolsosPendientes(): Observable<ReembolsoPendiente[]> {
    return this.http.get<ReembolsoPendiente[]>(
      API_CONFIG.ENDPOINTS.MOVIMIENTOS_REEMBOLSOS_PENDIENTES
    );
  }

  /**
   * Register a general expense (not associated with events)
   * PRD F13: Gastos generales
   */
  registrarGastoGeneral(
    cajaId: string,
    monto: number,
    descripcion: string,
    responsableId: string,
    medioPago: MedioPago,
    estadoPago: EstadoPago
  ): Observable<Movimiento> {
    const dto: CreateMovimientoDto = {
      cajaId,
      tipo: TipoMovimientoEnum.EGRESO,
      monto,
      concepto: ConceptoMovimiento.GASTO_GENERAL,
      descripcion,
      responsableId,
      medioPago,
      estadoPago,
    };
    return this.create(dto);
  }
}
