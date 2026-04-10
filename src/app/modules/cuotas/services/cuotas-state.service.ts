/**
 * Cuotas State Service
 * Gestiona estado con Signals (Angular 21)
 * SIN any - tipado estricto
 */

import { Injectable, Signal, WritableSignal, computed, signal, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

import { Cuota, CreateCuotaDto, UpdateCuotaDto } from '../../../shared/models';
import { EstadoCuota } from '../../../shared/enums';

import { CuotasApiService } from './cuotas-api.service';
import { ErrorHandlerService, NotificationService } from '../../../shared/services';

@Injectable({
  providedIn: 'root',
})
export class CuotasStateService {
  private readonly apiService = inject(CuotasApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly errorHandler = inject(ErrorHandlerService);

  // ============================================================================
  // State Signals (private - writable)
  // ============================================================================

  private readonly _cuotas: WritableSignal<Cuota[]> = signal([]);
  private readonly _loading: WritableSignal<boolean> = signal(false);
  private readonly _error: WritableSignal<string | null> = signal(null);
  private readonly _selectedId: WritableSignal<string | null> = signal(null);

  // ============================================================================
  // Public Readonly Signals
  // ============================================================================

  readonly cuotas: Signal<Cuota[]> = this._cuotas.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  // ============================================================================
  // Computed Signals (derived state)
  // ============================================================================

  readonly selected = computed((): Cuota | null => {
    const id = this._selectedId();
    return this._cuotas().find((c) => c.id === id) ?? null;
  });

  readonly totalMonto = computed((): number => {
    return this._cuotas().reduce((sum, c) => sum + c.montoTotal, 0);
  });

  readonly totalPagado = computed((): number => {
    return this._cuotas()
      .filter((c) => c.estado === EstadoCuota.PAGADO)
      .reduce((sum, c) => sum + c.montoPagado, 0);
  });

  readonly totalPendiente = computed((): number => {
    return this.totalMonto() - this.totalPagado();
  });

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Cargar todas las cuotas
   */
  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getAll().subscribe({
      next: (cuotas: Cuota[]) => {
        this._cuotas.set(cuotas);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al cargar cuotas'));
        this._loading.set(false);
      },
    });
  }

  /**
   * Cargar cuotas de una persona
   */
  loadByPersona(personaId: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getByPersona(personaId).subscribe({
      next: (cuotas: Cuota[]) => {
        this._cuotas.set(cuotas);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al cargar cuotas'));
        this._loading.set(false);
      },
    });
  }

  /**
   * Crear una nueva cuota
   */
  create(dto: CreateCuotaDto): Observable<Cuota> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.create(dto).pipe(
      tap((cuota: Cuota) => {
        this._cuotas.update((prev) => [...prev, cuota]);
        this.notificationService.showSuccess('Cuota creada exitosamente');
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al crear cuota'));
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Actualizar una cuota (PATCH)
   */
  update(id: string, dto: UpdateCuotaDto): Observable<Cuota> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.update(id, dto).pipe(
      tap((cuota: Cuota) => {
        this._cuotas.update((prev) => prev.map((c) => (c.id === id ? cuota : c)));
        this.notificationService.showSuccess('Cuota actualizada exitosamente');
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al actualizar cuota'));
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Registrar pago para cuota
   * Backend: POST /cuotas/:id/pago
   */
  registrarPago(
    cuotaId: string,
    monto: number,
    medioPago: string,
    responsableId: string,
  ): Observable<{ cuota: Cuota; movimiento: unknown }> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.registrarPago(cuotaId, monto, medioPago, responsableId).pipe(
      tap((response: { cuota: Cuota; movimiento: unknown }) => {
        this._cuotas.update((prev) => prev.map((c) => (c.id === cuotaId ? response.cuota : c)));
        this.notificationService.showSuccess('Pago registrado exitosamente');
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al registrar pago'));
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Seleccionar una cuota
   */
  select(id: string | null): void {
    this._selectedId.set(id);
  }

  /**
   * Limpiar estado
   */
  clear(): void {
    this._cuotas.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._selectedId.set(null);
  }
}
