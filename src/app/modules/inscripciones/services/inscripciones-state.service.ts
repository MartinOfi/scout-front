/**
 * Inscripciones State Service
 * Gestiona estado con Signals (Angular 21)
 * SIN any - tipado estricto
 */

import { Injectable, Signal, WritableSignal, computed, signal, inject } from '@angular/core';
import { Observable, throwError, firstValueFrom } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

import {
  Inscripcion,
  InscripcionConEstado,
  CreateInscripcionDto,
  UpdateInscripcionDto,
  PagoInscripcionDto,
  UpdatePagoDto,
} from '../../../shared/models';
import { TipoInscripcion } from '../../../shared/enums';

import { InscripcionesApiService, InscripcionesQueryParams } from './inscripciones-api.service';
import { NotificationService } from '../../../shared/services';

@Injectable({
  providedIn: 'root',
})
export class InscripcionesStateService {
  private readonly apiService = inject(InscripcionesApiService);
  private readonly notificationService = inject(NotificationService);

  // ============================================================================
  // State Signals (private - writable)
  // ============================================================================

  private readonly _inscripciones: WritableSignal<Inscripcion[]> = signal([]);
  private readonly _loading: WritableSignal<boolean> = signal(false);
  private readonly _error: WritableSignal<string | null> = signal(null);
  private readonly _selectedId: WritableSignal<string | null> = signal(null);
  private readonly _selectedDetail: WritableSignal<InscripcionConEstado | null> = signal(null);

  // ============================================================================
  // Public Readonly Signals
  // ============================================================================

  readonly inscripciones: Signal<Inscripcion[]> = this._inscripciones.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly selectedDetail: Signal<InscripcionConEstado | null> = this._selectedDetail.asReadonly();

  // ============================================================================
  // Computed Signals (derived state)
  // ============================================================================

  readonly selected = computed((): Inscripcion | null => {
    const id = this._selectedId();
    return this._inscripciones().find((i) => i.id === id) ?? null;
  });

  readonly inscripcionesGrupo = computed((): Inscripcion[] => {
    return this._inscripciones().filter((i) => i.tipo === 'grupo');
  });

  readonly inscripcionesScoutArgentina = computed((): Inscripcion[] => {
    return this._inscripciones().filter((i) => i.tipo === 'scout_argentina');
  });

  readonly totalInscripciones = computed((): number => {
    return this._inscripciones().length;
  });

  readonly totalMontoEsperado = computed((): number => {
    return this._inscripciones().reduce((sum, i) => sum + (i.montoTotal - i.montoBonificado), 0);
  });

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Cargar todas las inscripciones con filtros opcionales
   */
  load(params?: InscripcionesQueryParams): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getAll(params).subscribe({
      next: (inscripciones: Inscripcion[]) => {
        this._inscripciones.set(inscripciones);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar inscripciones';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Cargar inscripciones por año
   */
  loadByAno(ano: number): void {
    this.load({ ano });
  }

  /**
   * Cargar inscripciones por tipo
   */
  loadByTipo(tipo: TipoInscripcion): void {
    this.load({ tipo });
  }

  /**
   * Cargar detalle de una inscripción (con estado calculado)
   */
  loadDetail(id: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getById(id).subscribe({
      next: (detail: InscripcionConEstado) => {
        this._selectedDetail.set(detail);
        this._selectedId.set(id);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar detalle';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Cargar inscripciones de una persona
   */
  loadByPersona(personaId: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getByPersona(personaId).subscribe({
      next: (inscripciones: Inscripcion[]) => {
        this._inscripciones.set(inscripciones);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar inscripciones';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Crear una nueva inscripción
   */
  create(dto: CreateInscripcionDto): Observable<Inscripcion> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.create(dto).pipe(
      tap((inscripcion: Inscripcion) => {
        this._inscripciones.update((prev) => [...prev, inscripcion]);
        this.notificationService.showSuccess('Inscripción creada exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al crear inscripción';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Actualizar una inscripción (PATCH)
   * Use to update authorization fields or montoBonificado
   */
  update(id: string, dto: UpdateInscripcionDto): Observable<Inscripcion> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.update(id, dto).pipe(
      tap((inscripcion: Inscripcion) => {
        this._inscripciones.update((prev) => prev.map((i) => (i.id === id ? inscripcion : i)));
        this.notificationService.showSuccess('Inscripción actualizada exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al actualizar inscripción';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Eliminar una inscripción (Observable)
   */
  delete(id: string): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.delete(id).pipe(
      tap(() => {
        this._inscripciones.update((prev) => prev.filter((i) => i.id !== id));
        this.notificationService.showSuccess('Inscripción eliminada exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al eliminar inscripción';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Eliminar una inscripción (Promise)
   * Used by DeleteDialogComponent for async/await pattern
   */
  async deleteAsync(id: string): Promise<void> {
    return firstValueFrom(this.apiService.delete(id)).then(() => {
      this._inscripciones.update((prev) => prev.filter((i) => i.id !== id));
    });
  }

  /**
   * Registrar un pago posterior para una inscripción
   * POST /api/v1/inscripciones/:id/pagar
   */
  pagarInscripcion(id: string, dto: PagoInscripcionDto): Observable<InscripcionConEstado> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.pagarInscripcion(id, dto).pipe(
      tap((inscripcionConEstado: InscripcionConEstado) => {
        // Update detail view if currently selected
        if (this._selectedId() === id) {
          this._selectedDetail.set(inscripcionConEstado);
        }
        // Update list item
        this._inscripciones.update((prev) =>
          prev.map((i) => (i.id === id ? inscripcionConEstado : i)),
        );
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
   * Actualizar un pago existente
   * PATCH /api/v1/inscripciones/:id/pagos/:movimientoId
   */
  updatePago(
    inscripcionId: string,
    movimientoId: string,
    dto: UpdatePagoDto,
  ): Observable<InscripcionConEstado> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.updatePago(inscripcionId, movimientoId, dto).pipe(
      tap((inscripcionConEstado: InscripcionConEstado) => {
        if (this._selectedId() === inscripcionId) {
          this._selectedDetail.set(inscripcionConEstado);
        }
        this._inscripciones.update((prev) =>
          prev.map((i) => (i.id === inscripcionId ? inscripcionConEstado : i)),
        );
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
   * DELETE /api/v1/inscripciones/:id/pagos/:movimientoId
   */
  deletePago(inscripcionId: string, movimientoId: string): Observable<InscripcionConEstado> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.deletePago(inscripcionId, movimientoId).pipe(
      tap((inscripcionConEstado: InscripcionConEstado) => {
        if (this._selectedId() === inscripcionId) {
          this._selectedDetail.set(inscripcionConEstado);
        }
        this._inscripciones.update((prev) =>
          prev.map((i) => (i.id === inscripcionId ? inscripcionConEstado : i)),
        );
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
   * Seleccionar una inscripción
   */
  select(id: string | null): void {
    this._selectedId.set(id);
    if (id) {
      this.loadDetail(id);
    } else {
      this._selectedDetail.set(null);
    }
  }

  /**
   * Limpiar estado
   */
  clear(): void {
    this._inscripciones.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._selectedId.set(null);
    this._selectedDetail.set(null);
  }
}
