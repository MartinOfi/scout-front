/**
 * Eventos State Service
 * Gestiona estado con Signals (Angular 21)
 * SIN any - tipado estricto
 */

import { Injectable, Signal, WritableSignal, computed, signal, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

import {
  Evento,
  EventoConResumen,
  Producto,
  VentaProducto,
  Movimiento,
  CreateEventoDto,
  UpdateEventoDto,
  CreateProductoDto,
  CreateVentaProductoDto,
} from '../../../shared/models';

import { EventosApiService } from './eventos-api.service';
import { NotificationService } from '../../../shared/services';

@Injectable({
  providedIn: 'root',
})
export class EventosStateService {
  private readonly apiService = inject(EventosApiService);
  private readonly notificationService = inject(NotificationService);

  // ============================================================================
  // State Signals (private - writable)
  // ============================================================================

  private readonly _eventos: WritableSignal<Evento[]> = signal([]);
  private readonly _productos: WritableSignal<Record<string, Producto[]>> = signal({});
  private readonly _ventas: WritableSignal<Record<string, VentaProducto[]>> = signal({});
  private readonly _resumenes: WritableSignal<Record<string, EventoConResumen>> = signal({});
  private readonly _loading: WritableSignal<boolean> = signal(false);
  private readonly _error: WritableSignal<string | null> = signal(null);
  private readonly _selectedId: WritableSignal<string | null> = signal(null);

  // ============================================================================
  // Public Readonly Signals
  // ============================================================================

  readonly eventos: Signal<Evento[]> = this._eventos.asReadonly();
  readonly productos: Signal<Record<string, Producto[]>> = this._productos.asReadonly();
  readonly ventas: Signal<Record<string, VentaProducto[]>> = this._ventas.asReadonly();
  readonly resumenes: Signal<Record<string, EventoConResumen>> = this._resumenes.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  // ============================================================================
  // Computed Signals (derived state)
  // ============================================================================

  readonly selected = computed((): Evento | null => {
    const id = this._selectedId();
    return this._eventos().find((e) => e.id === id) ?? null;
  });

  readonly totalEventos = computed((): number => {
    return this._eventos().length;
  });

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Cargar todos los eventos
   */
  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getAll().subscribe({
      next: (eventos: Evento[]) => {
        this._eventos.set(eventos);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar eventos';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Crear un nuevo evento
   */
  create(dto: CreateEventoDto): Observable<Evento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.create(dto).pipe(
      tap((evento: Evento) => {
        this._eventos.update((prev) => [...prev, evento]);
        this.notificationService.showSuccess('Evento creado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al crear evento';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Actualizar un evento (PATCH)
   */
  update(id: string, dto: UpdateEventoDto): Observable<Evento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.update(id, dto).pipe(
      tap((evento: Evento) => {
        this._eventos.update((prev) =>
          prev.map((e) => (e.id === id ? evento : e))
        );
        this.notificationService.showSuccess('Evento actualizado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al actualizar evento';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Cargar productos de un evento
   */
  loadProductos(eventoId: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getProductos(eventoId).subscribe({
      next: (productos: Producto[]) => {
        this._productos.update((prev) => ({
          ...prev,
          [eventoId]: productos,
        }));
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar productos';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Crear un producto para un evento
   */
  createProducto(eventoId: string, dto: CreateProductoDto): Observable<Producto> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.createProducto(eventoId, dto).pipe(
      tap((producto: Producto) => {
        this._productos.update((prev) => ({
          ...prev,
          [eventoId]: [...(prev[eventoId] ?? []), producto],
        }));
        this.notificationService.showSuccess('Producto creado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al crear producto';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Cargar ventas de un evento
   */
  loadVentas(eventoId: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getVentas(eventoId).subscribe({
      next: (ventas: VentaProducto[]) => {
        this._ventas.update((prev) => ({
          ...prev,
          [eventoId]: ventas,
        }));
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar ventas';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Registrar una venta
   */
  registrarVenta(eventoId: string, dto: CreateVentaProductoDto): Observable<VentaProducto> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.registrarVenta(eventoId, dto).pipe(
      tap((venta: VentaProducto) => {
        this._ventas.update((prev) => ({
          ...prev,
          [eventoId]: [...(prev[eventoId] ?? []), venta],
        }));
        this.notificationService.showSuccess('Venta registrada exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al registrar venta';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Registrar ingreso en evento
   */
  registrarIngreso(
    eventoId: string,
    monto: number,
    descripcion: string
  ): Observable<Movimiento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.registrarIngreso(eventoId, monto, descripcion).pipe(
      tap(() => {
        this.notificationService.showSuccess('Ingreso registrado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al registrar ingreso';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Registrar egreso en evento
   */
  registrarEgreso(
    eventoId: string,
    monto: number,
    descripcion: string,
    responsableId: string,
    medioPago: string,
    estadoPago: string
  ): Observable<Movimiento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.registrarEgreso(
      eventoId,
      monto,
      descripcion,
      responsableId,
      medioPago,
      estadoPago
    ).pipe(
      tap(() => {
        this.notificationService.showSuccess('Egreso registrado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al registrar egreso';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Cargar resumen financiero de evento
   */
  loadResumen(eventoId: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getResumen(eventoId).subscribe({
      next: (resumen: { totalIngresos: number; totalEgresos: number; resultadoNeto: number }) => {
        this._resumenes.update((prev) => ({
          ...prev,
          [eventoId]: { ...this.selected(), ...resumen } as EventoConResumen,
        }));
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar resumen';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Seleccionar un evento
   */
  select(id: string | null): void {
    this._selectedId.set(id);
  }

  /**
   * Limpiar estado
   */
  clear(): void {
    this._eventos.set([]);
    this._productos.set({});
    this._ventas.set({});
    this._resumenes.set({});
    this._loading.set(false);
    this._error.set(null);
    this._selectedId.set(null);
  }
}
