/**
 * Campamentos State Service
 * Gestiona estado con Signals (Angular 21)
 * SIN any - tipado estricto
 */

import { Injectable, Signal, WritableSignal, computed, signal, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

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

import { CampamentosApiService } from './campamentos-api.service';
import { NotificationService } from '../../../shared/services';

@Injectable({
  providedIn: 'root',
})
export class CampamentosStateService {
  private readonly apiService = inject(CampamentosApiService);
  private readonly notificationService = inject(NotificationService);

  // ============================================================================
  // State Signals (private - writable)
  // ============================================================================

  private readonly _campamentos: WritableSignal<Campamento[]> = signal([]);
  private readonly _pagosPorParticipante: WritableSignal<Record<string, PagoParticipante[]>> =
    signal({});
  private readonly _loading: WritableSignal<boolean> = signal(false);
  private readonly _error: WritableSignal<string | null> = signal(null);
  private readonly _selectedId: WritableSignal<string | null> = signal(null);

  // ============================================================================
  // Public Readonly Signals
  // ============================================================================

  readonly campamentos: Signal<Campamento[]> = this._campamentos.asReadonly();
  readonly pagosPorParticipante: Signal<Record<string, PagoParticipante[]>> =
    this._pagosPorParticipante.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  // ============================================================================
  // Computed Signals (derived state)
  // ============================================================================

  readonly selected = computed((): Campamento | null => {
    const id = this._selectedId();
    return this._campamentos().find((c) => c.id === id) ?? null;
  });

  readonly totalCampamentos = computed((): number => {
    return this._campamentos().length;
  });

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Cargar todos los campamentos
   */
  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getAll().subscribe({
      next: (campamentos: Campamento[]) => {
        this._campamentos.set(campamentos);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar campamentos';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Crear un nuevo campamento
   */
  create(dto: CreateCampamentoDto): Observable<Campamento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.create(dto).pipe(
      tap((campamento: Campamento) => {
        this._campamentos.update((prev) => [...prev, campamento]);
        this.notificationService.showSuccess('Campamento creado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al crear campamento';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Actualizar un campamento (PATCH)
   */
  update(id: string, dto: UpdateCampamentoDto): Observable<Campamento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.update(id, dto).pipe(
      tap((campamento: Campamento) => {
        this._campamentos.update((prev) => prev.map((c) => (c.id === id ? campamento : c)));
        this.notificationService.showSuccess('Campamento actualizado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al actualizar campamento';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Agregar un participante al campamento
   */
  addParticipante(campamentoId: string, dto: AddParticipanteDto): Observable<Campamento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.addParticipante(campamentoId, dto).pipe(
      tap((campamento: Campamento) => {
        this._campamentos.update((prev) =>
          prev.map((c) => (c.id === campamentoId ? campamento : c)),
        );
        this.notificationService.showSuccess('Participante agregado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al agregar participante';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Remover un participante del campamento
   */
  removeParticipante(campamentoId: string, personaId: string): Observable<Campamento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.removeParticipante(campamentoId, personaId).pipe(
      tap((campamento: Campamento) => {
        this._campamentos.update((prev) =>
          prev.map((c) => (c.id === campamentoId ? campamento : c)),
        );
        this.notificationService.showSuccess('Participante removido exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al remover participante';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Registrar un pago para campamento
   */
  registrarPago(campamentoId: string, dto: RegistrarPagoCampamentoDto): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.registrarPago(campamentoId, dto).pipe(
      tap(() => {
        this.notificationService.showSuccess('Pago registrado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al registrar pago';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Registrar un gasto para campamento
   */
  registrarGasto(campamentoId: string, dto: RegistrarGastoCampamentoDto): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.registrarGasto(campamentoId, dto).pipe(
      tap(() => {
        this.notificationService.showSuccess('Gasto registrado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al registrar gasto';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Actualizar un pago existente
   * PATCH /api/v1/campamentos/:id/pagos/:movimientoId
   */
  updatePago(campamentoId: string, movimientoId: string, dto: UpdatePagoDto): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.updatePago(campamentoId, movimientoId, dto).pipe(
      tap(() => {
        this.loadPagosPorParticipante(campamentoId);
        this.notificationService.showSuccess('Pago actualizado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al actualizar pago';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Eliminar un pago existente
   * DELETE /api/v1/campamentos/:id/pagos/:movimientoId
   */
  deletePago(campamentoId: string, movimientoId: string): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.deletePago(campamentoId, movimientoId).pipe(
      tap(() => {
        this.loadPagosPorParticipante(campamentoId);
        this.notificationService.showSuccess('Pago eliminado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al eliminar pago';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Cargar pagos por participante de un campamento
   */
  loadPagosPorParticipante(campamentoId: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getPagosPorParticipante(campamentoId).subscribe({
      next: (pagos: PagoParticipante[]) => {
        this._pagosPorParticipante.update((prev) => ({
          ...prev,
          [campamentoId]: pagos,
        }));
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar pagos';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Seleccionar un campamento
   */
  select(id: string | null): void {
    this._selectedId.set(id);
  }

  /**
   * Limpiar estado
   */
  clear(): void {
    this._campamentos.set([]);
    this._pagosPorParticipante.set({});
    this._loading.set(false);
    this._error.set(null);
    this._selectedId.set(null);
  }
}
