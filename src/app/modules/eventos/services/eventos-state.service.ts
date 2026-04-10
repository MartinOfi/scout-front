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
} from '../../../shared/models';

import { EventosApiService } from './eventos-api.service';
import { ErrorHandlerService, NotificationService } from '../../../shared/services';

@Injectable({
  providedIn: 'root',
})
export class EventosStateService {
  private readonly apiService = inject(EventosApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly errorHandler = inject(ErrorHandlerService);

  // ============================================================================
  // State Signals (private — writable)
  // ============================================================================

  private readonly _eventos: WritableSignal<Evento[]> = signal([]);
  private readonly _productos: WritableSignal<Record<string, Producto[]>> = signal({});
  private readonly _ventas: WritableSignal<Record<string, VentaProducto[]>> = signal({});
  private readonly _kpis: WritableSignal<Record<string, EventoKpis>> = signal({});
  private readonly _resumenVentas: WritableSignal<Record<string, ResumenVentas>> = signal({});
  private readonly _movimientos: WritableSignal<Record<string, Movimiento[]>> = signal({});
  private readonly _loading: WritableSignal<boolean> = signal(false);
  private readonly _error: WritableSignal<string | null> = signal(null);
  private readonly _selectedId: WritableSignal<string | null> = signal(null);

  // ============================================================================
  // Public Readonly Signals
  // ============================================================================

  readonly eventos: Signal<Evento[]> = this._eventos.asReadonly();
  readonly productos: Signal<Record<string, Producto[]>> = this._productos.asReadonly();
  readonly ventas: Signal<Record<string, VentaProducto[]>> = this._ventas.asReadonly();
  readonly kpis: Signal<Record<string, EventoKpis>> = this._kpis.asReadonly();
  readonly resumenVentas: Signal<Record<string, ResumenVentas>> = this._resumenVentas.asReadonly();
  readonly movimientos: Signal<Record<string, Movimiento[]>> = this._movimientos.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

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

  loadVentas(eventoId: string): void {
    this._loading.set(true);

    this.apiService.getVentas(eventoId).subscribe({
      next: (ventas) => {
        this._ventas.update((prev) => ({ ...prev, [eventoId]: ventas }));
        this._loading.set(false);
      },
      error: (err: unknown) => {
        this._handleError(err, 'Error al cargar ventas');
      },
    });
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
  // Util
  // ============================================================================

  clear(): void {
    this._eventos.set([]);
    this._productos.set({});
    this._ventas.set({});
    this._kpis.set({});
    this._resumenVentas.set({});
    this._loading.set(false);
    this._error.set(null);
    this._selectedId.set(null);
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
