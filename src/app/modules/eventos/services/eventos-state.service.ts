/**
 * Eventos State Service
 * Gestiona estado con Signals (Angular 21)
 * SIN any — tipado estricto
 */

import { Injectable, Signal, WritableSignal, computed, signal, inject } from '@angular/core';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import {
  Evento,
  EventoKpis,
  Producto,
  VentaProducto,
  ResumenVentas,
  Movimiento,
  CreateEventoDto,
  UpdateEventoDto,
  CreateProductoDto,
  UpdateProductoDto,
  CreateVentaProductoDto,
  RegisterVentasLoteDto,
  RegistrarIngresoEventoDto,
  RegistrarGastoEventoDto,
  DeleteVentaResponse,
  CreateEntregaDto,
  EntregaResponse,
  StockEntregaResponse,
} from '../../../shared/models';

import { EventosApiService } from './eventos-api.service';
import { MovimientosApiService } from '../../movimientos/services/movimientos-api.service';
import { ErrorHandlerService, NotificationService } from '../../../shared/services';

@Injectable({
  providedIn: 'root',
})
export class EventosStateService {
  private readonly apiService = inject(EventosApiService);
  private readonly movimientosApi = inject(MovimientosApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly errorHandler = inject(ErrorHandlerService);

  // ============================================================================
  // State Signals (private — writable)
  // ============================================================================

  private readonly _eventos: WritableSignal<Evento[]> = signal([]);
  private readonly _productos: WritableSignal<Record<string, Producto[]>> = signal({});
  private readonly _ventas: WritableSignal<Record<string, VentaProducto[]>> = signal({});
  /**
   * Active vendedor filter per evento. Persisted in state so cascade
   * refreshes (after a delete) can re-apply the user's current search
   * instead of clobbering it back to the unfiltered list.
   */
  private readonly _ventasFilter: WritableSignal<Record<string, string | undefined>> = signal({});
  private readonly _kpis: WritableSignal<Record<string, EventoKpis>> = signal({});
  private readonly _resumenVentas: WritableSignal<Record<string, ResumenVentas>> = signal({});
  private readonly _movimientos: WritableSignal<Record<string, Movimiento[]>> = signal({});
  private readonly _entregas: WritableSignal<Record<string, EntregaResponse[]>> = signal({});
  private readonly _stockEntregas: WritableSignal<Record<string, StockEntregaResponse[]>> = signal(
    {},
  );
  /**
   * Active vendedor filter per evento for the entregas tab. Persisted so
   * post-mutation refreshes can re-apply the search instead of clobbering
   * it back to unfiltered (same shape as _ventasFilter).
   */
  private readonly _entregasFilter: WritableSignal<Record<string, string | undefined>> = signal({});
  private readonly _loading: WritableSignal<boolean> = signal(false);
  private readonly _error: WritableSignal<string | null> = signal(null);
  private readonly _selectedId: WritableSignal<string | null> = signal(null);
  private readonly _deletingIds: WritableSignal<ReadonlySet<string>> = signal(new Set());

  // ============================================================================
  // Public Readonly Signals
  // ============================================================================

  readonly eventos: Signal<Evento[]> = this._eventos.asReadonly();
  readonly productos: Signal<Record<string, Producto[]>> = this._productos.asReadonly();
  readonly ventas: Signal<Record<string, VentaProducto[]>> = this._ventas.asReadonly();
  readonly kpis: Signal<Record<string, EventoKpis>> = this._kpis.asReadonly();
  readonly resumenVentas: Signal<Record<string, ResumenVentas>> = this._resumenVentas.asReadonly();
  readonly movimientos: Signal<Record<string, Movimiento[]>> = this._movimientos.asReadonly();
  readonly entregas: Signal<Record<string, EntregaResponse[]>> = this._entregas.asReadonly();
  readonly stockEntregas: Signal<Record<string, StockEntregaResponse[]>> =
    this._stockEntregas.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly deletingIds: Signal<ReadonlySet<string>> = this._deletingIds.asReadonly();

  isDeleting(id: string): boolean {
    return this._deletingIds().has(id);
  }

  // ============================================================================
  // Computed Signals
  // ============================================================================

  readonly selected = computed((): Evento | null => {
    const id = this._selectedId();
    return this._eventos().find((e) => e.id === id) ?? null;
  });

  readonly totalEventos = computed((): number => this._eventos().length);

  // ============================================================================
  // Evento Actions
  // ============================================================================

  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getAll().subscribe({
      next: (eventos) => {
        this._eventos.set(eventos);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        this._handleError(err, 'Error al cargar eventos');
      },
    });
  }

  loadById(id: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getById(id).subscribe({
      next: (evento) => {
        this._eventos.update((prev) => {
          const exists = prev.some((e) => e.id === id);
          return exists ? prev.map((e) => (e.id === id ? evento : e)) : [...prev, evento];
        });
        this._selectedId.set(id);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        this._handleError(err, 'Error al cargar el evento');
      },
    });
  }

  create(dto: CreateEventoDto): Observable<Evento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.create(dto).pipe(
      tap((evento) => {
        this._eventos.update((prev) => [...prev, evento]);
        this.notificationService.showSuccess('Evento creado exitosamente');
      }),
      catchError((err: unknown) => this._catchError(err, 'Error al crear evento')),
      finalize(() => this._loading.set(false)),
    );
  }

  update(id: string, dto: UpdateEventoDto): Observable<Evento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.update(id, dto).pipe(
      tap((evento) => {
        this._eventos.update((prev) => prev.map((e) => (e.id === id ? evento : e)));
        this.notificationService.showSuccess('Evento actualizado exitosamente');
      }),
      catchError((err: unknown) => this._catchError(err, 'Error al actualizar evento')),
      finalize(() => this._loading.set(false)),
    );
  }

  updateReportePublico(id: string, reportePublico: boolean): Observable<Evento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.updateReportePublico(id, reportePublico).pipe(
      tap((evento) => {
        this._eventos.update((prev) => prev.map((e) => (e.id === id ? evento : e)));
        this.notificationService.showSuccess('Visibilidad del reporte actualizada');
      }),
      catchError((err: unknown) => this._catchError(err, 'Error al actualizar el reporte')),
      finalize(() => this._loading.set(false)),
    );
  }

  cerrarEvento(id: string): Observable<Evento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.cerrarEvento(id).pipe(
      tap((evento) => {
        this._eventos.update((prev) => prev.map((e) => (e.id === id ? evento : e)));
        this.notificationService.showSuccess('Evento cerrado exitosamente');
      }),
      catchError((err: unknown) => this._catchError(err, 'Error al cerrar el evento')),
      finalize(() => this._loading.set(false)),
    );
  }

  delete(id: string): Observable<void> {
    this._markDeleting(id);
    return this.apiService.delete(id).pipe(
      tap(() => {
        this._eventos.update((prev) => prev.filter((e) => e.id !== id));
        if (this._selectedId() === id) {
          this._selectedId.set(null);
        }
        this.notificationService.showSuccess('Evento eliminado exitosamente');
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al eliminar evento'));
        return throwError(() => err);
      }),
      finalize(() => this._unmarkDeleting(id)),
    );
  }

  /**
   * Borra una venta. Cuando la venta forma parte de un lote, el backend
   * cascadea: borra todas las hermanas del mismo movimientoId y el movimiento
   * agregado. Por eso después del éxito refrescamos ventas + movimientos +
   * KPIs + resumen contra el backend en lugar de hacer un patch optimista
   * (que solo conoce la venta clickeada y dejaría a las hermanas zombi en
   * el state local).
   */
  deleteVenta(eventoId: string, ventaId: string): Observable<DeleteVentaResponse> {
    this._markDeleting(ventaId);
    return this.apiService.deleteVenta(eventoId, ventaId).pipe(
      tap((response) => {
        this._notifyVentaDeleted(response);
        this._refreshEventoAfterMutation(eventoId);
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al eliminar venta'));
        return throwError(() => err);
      }),
      finalize(() => this._unmarkDeleting(ventaId)),
    );
  }

  /**
   * Recarga las colecciones del evento que pueden haber cambiado tras un
   * borrado en cascada (ventas, movimientos, KPIs). Re-aplica el filtro
   * de vendedor activo para no clobberar el contexto de búsqueda del
   * usuario.
   */
  private _refreshEventoAfterMutation(eventoId: string): void {
    const activeFilter = this._ventasFilter()[eventoId];
    this.loadVentas(eventoId, activeFilter).subscribe();
    this.loadMovimientos(eventoId);
    this.loadKpis(eventoId);
  }

  private _notifyVentaDeleted(response: DeleteVentaResponse): void {
    if (response.hermanasEliminadas > 0) {
      const total = response.hermanasEliminadas + 1;
      this.notificationService.showSuccess(
        `Se eliminó la venta junto con ${response.hermanasEliminadas} venta(s) más del mismo lote (${total} en total)`,
      );
      return;
    }
    this.notificationService.showSuccess('Venta eliminada exitosamente');
  }

  deleteMovimiento(eventoId: string, movimientoId: string): Observable<void> {
    this._markDeleting(movimientoId);
    return this.movimientosApi.delete(movimientoId).pipe(
      tap(() => {
        this._movimientos.update((prev) => ({
          ...prev,
          [eventoId]: (prev[eventoId] ?? []).filter((m) => m.id !== movimientoId),
        }));
        this.notificationService.showSuccess('Movimiento eliminado exitosamente');
        this.loadKpis(eventoId);
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al eliminar movimiento'));
        return throwError(() => err);
      }),
      finalize(() => this._unmarkDeleting(movimientoId)),
    );
  }

  private _markDeleting(id: string): void {
    this._deletingIds.update((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  private _unmarkDeleting(id: string): void {
    this._deletingIds.update((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  select(id: string | null): void {
    this._selectedId.set(id);
  }

  // ============================================================================
  // KPIs & Resumen Actions
  // ============================================================================

  loadKpis(eventoId: string): void {
    this._loading.set(true);

    this.apiService.getKpis(eventoId).subscribe({
      next: (kpis) => {
        this._kpis.update((prev) => ({ ...prev, [eventoId]: kpis }));
        this._loading.set(false);
      },
      error: (err: unknown) => {
        this._handleError(err, 'Error al cargar KPIs');
      },
    });
  }

  loadResumenVentas(eventoId: string, vendedor?: string): Observable<void> {
    this._loading.set(true);

    const obs$ = this.apiService.getResumenVentas(eventoId, vendedor).pipe(
      tap((resumen) => {
        this._resumenVentas.update((prev) => ({ ...prev, [eventoId]: resumen }));
        this._loading.set(false);
      }),
      catchError((err: unknown) => {
        this._handleError(err, 'Error al cargar resumen de ventas');
        return EMPTY;
      }),
      map(() => undefined as void),
    );

    obs$.subscribe();
    return obs$;
  }

  loadMovimientos(eventoId: string, filters?: { tipo?: string; concepto?: string }): void {
    this._loading.set(true);

    this.apiService.getMovimientos(eventoId, filters).subscribe({
      next: (movimientos) => {
        this._movimientos.update((prev) => ({ ...prev, [eventoId]: movimientos }));
        this._loading.set(false);
      },
      error: (err: unknown) => {
        this._handleError(err, 'Error al cargar movimientos');
      },
    });
  }

  // ============================================================================
  // Producto Actions
  // ============================================================================

  loadProductos(eventoId: string): void {
    this._loading.set(true);

    this.apiService.getProductos(eventoId).subscribe({
      next: (productos) => {
        this._productos.update((prev) => ({ ...prev, [eventoId]: productos }));
        this._loading.set(false);
      },
      error: (err: unknown) => {
        this._handleError(err, 'Error al cargar productos');
      },
    });
  }

  createProducto(eventoId: string, dto: CreateProductoDto): Observable<Producto> {
    this._loading.set(true);

    return this.apiService.createProducto(eventoId, dto).pipe(
      tap((producto) => {
        this._productos.update((prev) => ({
          ...prev,
          [eventoId]: [...(prev[eventoId] ?? []), producto],
        }));
        this.notificationService.showSuccess('Producto creado exitosamente');
      }),
      catchError((err: unknown) => this._catchError(err, 'Error al crear producto')),
      finalize(() => this._loading.set(false)),
    );
  }

  updateProducto(
    eventoId: string,
    productoId: string,
    dto: UpdateProductoDto,
  ): Observable<Producto> {
    this._loading.set(true);

    return this.apiService.updateProducto(productoId, dto).pipe(
      tap((updated) => {
        this._productos.update((prev) => ({
          ...prev,
          [eventoId]: (prev[eventoId] ?? []).map((p) => (p.id === productoId ? updated : p)),
        }));
        this.notificationService.showSuccess('Producto actualizado exitosamente');
      }),
      catchError((err: unknown) => this._catchError(err, 'Error al actualizar producto')),
      finalize(() => this._loading.set(false)),
    );
  }

  deleteProducto(eventoId: string, productoId: string): Observable<void> {
    this._loading.set(true);

    return this.apiService.deleteProducto(productoId).pipe(
      tap(() => {
        this._productos.update((prev) => ({
          ...prev,
          [eventoId]: (prev[eventoId] ?? []).filter((p) => p.id !== productoId),
        }));
        this.notificationService.showSuccess('Producto eliminado exitosamente');
      }),
      catchError((err: unknown) => this._catchError(err, 'Error al eliminar producto')),
      finalize(() => this._loading.set(false)),
    );
  }

  // ============================================================================
  // Venta Actions
  // ============================================================================

  /**
   * Loads ventas for an evento, optionally filtered by vendedor name.
   * Returns a cold Observable so callers (e.g. a debounced search input)
   * can compose it with `switchMap` and auto-cancel stale in-flight
   * requests when a newer query arrives.
   *
   * The active filter is persisted in `_ventasFilter` so post-mutation
   * refreshes can re-apply it transparently.
   */
  loadVentas(eventoId: string, vendedor?: string): Observable<VentaProducto[]> {
    this._loading.set(true);
    this._ventasFilter.update((prev) => ({ ...prev, [eventoId]: vendedor }));

    return this.apiService.getVentas(eventoId, vendedor).pipe(
      tap((ventas) => {
        this._ventas.update((prev) => ({ ...prev, [eventoId]: ventas }));
        this._loading.set(false);
      }),
      catchError((err: unknown) => {
        this._handleError(err, 'Error al cargar ventas');
        return EMPTY;
      }),
    );
  }

  registrarVenta(eventoId: string, dto: CreateVentaProductoDto): Observable<VentaProducto> {
    this._loading.set(true);

    return this.apiService.registrarVenta(eventoId, dto).pipe(
      tap((venta) => {
        this._ventas.update((prev) => ({
          ...prev,
          [eventoId]: [...(prev[eventoId] ?? []), venta],
        }));
        this.notificationService.showSuccess('Venta registrada exitosamente');
      }),
      catchError((err: unknown) => this._catchError(err, 'Error al registrar venta')),
      finalize(() => this._loading.set(false)),
    );
  }

  registrarVentasLote(eventoId: string, dto: RegisterVentasLoteDto): Observable<VentaProducto[]> {
    this._loading.set(true);

    return this.apiService.registrarVentasLote(eventoId, dto).pipe(
      tap((nuevasVentas) => {
        this._ventas.update((prev) => ({
          ...prev,
          [eventoId]: [...(prev[eventoId] ?? []), ...nuevasVentas],
        }));
        this.notificationService.showSuccess('Ventas registradas exitosamente');
      }),
      catchError((err: unknown) => this._catchError(err, 'Error al registrar ventas')),
      finalize(() => this._loading.set(false)),
    );
  }

  // ============================================================================
  // Ingreso / Gasto Actions
  // ============================================================================

  registrarIngreso(eventoId: string, dto: RegistrarIngresoEventoDto): Observable<Movimiento> {
    this._loading.set(true);

    return this.apiService.registrarIngreso(eventoId, dto).pipe(
      tap(() => {
        this.notificationService.showSuccess('Ingreso registrado exitosamente');
        this.loadKpis(eventoId);
      }),
      catchError((err: unknown) => this._catchError(err, 'Error al registrar ingreso')),
      finalize(() => this._loading.set(false)),
    );
  }

  registrarGasto(eventoId: string, dto: RegistrarGastoEventoDto): Observable<Movimiento> {
    this._loading.set(true);

    return this.apiService.registrarGasto(eventoId, dto).pipe(
      tap(() => {
        this.notificationService.showSuccess('Gasto registrado exitosamente');
        this.loadKpis(eventoId);
      }),
      catchError((err: unknown) => this._catchError(err, 'Error al registrar gasto')),
      finalize(() => this._loading.set(false)),
    );
  }

  // ============================================================================
  // Entrega Actions
  // ============================================================================

  /**
   * Loads entregas for an evento, optionally filtered by vendedor name.
   * Returns a cold Observable so callers can compose with switchMap (same
   * pattern as loadVentas).
   */
  loadEntregas(eventoId: string, vendedor?: string): Observable<EntregaResponse[]> {
    this._loading.set(true);
    this._entregasFilter.update((prev) => ({ ...prev, [eventoId]: vendedor }));

    return this.apiService.getEntregas(eventoId, vendedor).pipe(
      tap((entregas) => {
        this._entregas.update((prev) => ({ ...prev, [eventoId]: entregas }));
      }),
      catchError((err: unknown) => {
        this._handleError(err, 'Error al cargar entregas');
        return EMPTY;
      }),
      // finalize fires on success, error AND unsubscribe (switchMap cancel).
      // Without it, a cancelled request would leave _loading stuck at true.
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Loads the stock-disponible report for an evento. Used by the entregas
   * tab to show vendor rows with "entregado/vendido" per product, and by
   * the entrega dialog to filter the products list to those with stock > 0
   * for the chosen vendedor.
   */
  loadStockEntregas(eventoId: string, vendedor?: string): Observable<StockEntregaResponse[]> {
    this._loading.set(true);

    return this.apiService.getStockEntregas(eventoId, vendedor).pipe(
      tap((stock) => {
        this._stockEntregas.update((prev) => ({ ...prev, [eventoId]: stock }));
      }),
      catchError((err: unknown) => {
        this._handleError(err, 'Error al cargar stock de entregas');
        return EMPTY;
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  crearEntrega(eventoId: string, dto: CreateEntregaDto): Observable<EntregaResponse> {
    this._loading.set(true);

    return this.apiService.crearEntrega(eventoId, dto).pipe(
      tap(() => {
        this.notificationService.showSuccess('Entrega registrada exitosamente');
        // Refetch both lists with the active filter rather than prepending
        // optimistically. Prepending would inject the new entrega into a
        // filtered list even if the filter excludes it (e.g. filter="Ana",
        // entrega for "Juan" appears in the filtered view until the next
        // search/refresh). A refetch keeps the view consistent.
        const activeFilter = this._entregasFilter()[eventoId];
        this.loadEntregas(eventoId, activeFilter).subscribe();
        this.loadStockEntregas(eventoId, activeFilter).subscribe();
      }),
      catchError((err: unknown) => this._catchError(err, 'Error al registrar entrega')),
      finalize(() => this._loading.set(false)),
    );
  }

  deleteEntrega(eventoId: string, entregaId: string): Observable<void> {
    this._markDeleting(entregaId);
    return this.apiService.deleteEntrega(eventoId, entregaId).pipe(
      tap(() => {
        this._entregas.update((prev) => ({
          ...prev,
          [eventoId]: (prev[eventoId] ?? []).filter((e) => e.id !== entregaId),
        }));
        this.notificationService.showSuccess('Entrega eliminada exitosamente');
        const activeFilter = this._entregasFilter()[eventoId];
        this.loadStockEntregas(eventoId, activeFilter).subscribe();
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al eliminar entrega'));
        return throwError(() => err);
      }),
      finalize(() => this._unmarkDeleting(entregaId)),
    );
  }

  // ============================================================================
  // Util
  // ============================================================================

  clear(): void {
    this._eventos.set([]);
    this._productos.set({});
    this._ventas.set({});
    this._ventasFilter.set({});
    this._kpis.set({});
    this._resumenVentas.set({});
    this._movimientos.set({});
    this._entregas.set({});
    this._stockEntregas.set({});
    this._entregasFilter.set({});
    this._loading.set(false);
    this._error.set(null);
    this._selectedId.set(null);
    this._deletingIds.set(new Set());
  }

  private _handleError(err: unknown, fallback: string): void {
    this._error.set(this.errorHandler.extractMessage(err, fallback));
    this._loading.set(false);
  }

  private _catchError(err: unknown, fallback: string): Observable<never> {
    this._error.set(this.errorHandler.extractMessage(err, fallback));
    return throwError(() => err);
  }
}
