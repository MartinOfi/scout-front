/**
 * Movimientos State Service
 * Gestiona estado con Signals (Angular 21)
 * SIN any - tipado estricto
 */

import { Injectable, Signal, WritableSignal, computed, signal, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

import {
  Movimiento,
  CreateMovimientoDto,
  UpdateMovimientoDto,
  MovimientosFilters,
  ReembolsoPendiente,
  PaginationMeta,
} from '../../../shared/models';

import { MovimientosApiService } from './movimientos-api.service';
import { NotificationService } from '../../../shared/services';
import { MedioPago, EstadoPago, TipoMovimientoEnum } from '../../../shared/enums';

@Injectable({
  providedIn: 'root',
})
export class MovimientosStateService {
  private readonly apiService = inject(MovimientosApiService);
  private readonly notificationService = inject(NotificationService);

  // ============================================================================
  // State Signals (private - writable)
  // ============================================================================

  private readonly _movimientos: WritableSignal<Movimiento[]> = signal([]);
  private readonly _reembolsosPendientes: WritableSignal<ReembolsoPendiente[]> = signal([]);
  private readonly _filters: WritableSignal<MovimientosFilters> = signal({});
  private readonly _loading: WritableSignal<boolean> = signal(false);
  private readonly _error: WritableSignal<string | null> = signal(null);
  private readonly _selectedId: WritableSignal<string | null> = signal(null);

  // Pagination Signals
  private readonly _currentPage: WritableSignal<number> = signal(1);
  private readonly _pageSize: WritableSignal<number> = signal(25);
  private readonly _totalItems: WritableSignal<number> = signal(0);
  private readonly _paginationMeta: WritableSignal<PaginationMeta | null> = signal(null);

  // ============================================================================
  // Public Readonly Signals
  // ============================================================================

  readonly movimientos: Signal<Movimiento[]> = this._movimientos.asReadonly();
  readonly reembolsosPendientes: Signal<ReembolsoPendiente[]> =
    this._reembolsosPendientes.asReadonly();
  readonly filters: Signal<MovimientosFilters> = this._filters.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  // Pagination Readonly Signals
  readonly currentPage: Signal<number> = this._currentPage.asReadonly();
  readonly pageSize: Signal<number> = this._pageSize.asReadonly();
  readonly totalItems: Signal<number> = this._totalItems.asReadonly();
  readonly paginationMeta: Signal<PaginationMeta | null> = this._paginationMeta.asReadonly();

  // Pagination Computed Signals
  readonly totalPages = computed((): number => {
    const total = this._totalItems();
    const size = this._pageSize();
    return size > 0 ? Math.ceil(total / size) : 0;
  });

  readonly hasNextPage = computed((): boolean => {
    return this._currentPage() < this.totalPages();
  });

  readonly hasPreviousPage = computed((): boolean => {
    return this._currentPage() > 1;
  });

  // ============================================================================
  // Computed Signals (derived state)
  // ============================================================================

  readonly selected = computed((): Movimiento | null => {
    const id = this._selectedId();
    return this._movimientos().find((m) => m.id === id) ?? null;
  });

  readonly filtered = computed((): Movimiento[] => {
    const movimientos = this._movimientos();
    const filters = this._filters();

    return movimientos.filter((m) => {
      if (filters.tipo && m.tipo !== filters.tipo) return false;
      if (filters.concepto && m.concepto !== filters.concepto) return false;
      if (filters.responsableId && m.responsableId !== filters.responsableId) return false;
      if (filters.estadoPago && m.estadoPago !== filters.estadoPago) return false;
      if (filters.cajaId && m.cajaId !== filters.cajaId) return false;

      if (filters.fechaInicio) {
        const fechaInicio = new Date(filters.fechaInicio);
        if (new Date(m.fecha) < fechaInicio) return false;
      }

      if (filters.fechaFin) {
        const fechaFin = new Date(filters.fechaFin);
        if (new Date(m.fecha) > fechaFin) return false;
      }

      return true;
    });
  });

  readonly totalIngresos = computed((): number => {
    return this.filtered()
      .filter((m) => m.tipo === TipoMovimientoEnum.INGRESO)
      .reduce((sum, m) => sum + m.monto, 0);
  });

  readonly totalEgresos = computed((): number => {
    return this.filtered()
      .filter((m) => m.tipo === TipoMovimientoEnum.EGRESO)
      .reduce((sum, m) => sum + m.monto, 0);
  });

  readonly saldoNeto = computed((): number => {
    return this.totalIngresos() - this.totalEgresos();
  });

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Cargar todos los movimientos
   */
  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getAll(this._filters()).subscribe({
      next: (movimientos: Movimiento[]) => {
        this._movimientos.set(movimientos);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar movimientos';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Crear un nuevo movimiento
   */
  create(dto: CreateMovimientoDto): Observable<Movimiento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.create(dto).pipe(
      tap((movimiento: Movimiento) => {
        this._movimientos.update((prev) => [...prev, movimiento]);
        this.notificationService.showSuccess('Movimiento registrado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al crear movimiento';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Actualizar un movimiento (PATCH)
   */
  update(id: string, dto: UpdateMovimientoDto): Observable<Movimiento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.update(id, dto).pipe(
      tap((movimiento: Movimiento) => {
        this._movimientos.update((prev) => prev.map((m) => (m.id === id ? movimiento : m)));
        this.notificationService.showSuccess('Movimiento actualizado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al actualizar movimiento';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Eliminar (soft delete) un movimiento
   */
  delete(id: string): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.delete(id).pipe(
      tap(() => {
        this._movimientos.update((prev) => prev.filter((m) => m.id !== id));
        this.notificationService.showSuccess('Movimiento eliminado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al eliminar movimiento';
        this._error.set(errorMsg);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Cargar reembolsos pendientes
   */
  loadReembolsosPendientes(): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getReembolsosPendientes().subscribe({
      next: (reembolsos: ReembolsoPendiente[]) => {
        this._reembolsosPendientes.set(reembolsos);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar reembolsos';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Registrar un gasto general
   */
  registrarGastoGeneral(
    cajaId: string,
    monto: number,
    descripcion: string,
    responsableId: string,
    medioPago: MedioPago,
    estadoPago: EstadoPago,
  ): Observable<Movimiento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService
      .registrarGastoGeneral(cajaId, monto, descripcion, responsableId, medioPago, estadoPago)
      .pipe(
        tap((movimiento: Movimiento) => {
          this._movimientos.update((prev) => [...prev, movimiento]);
          this.notificationService.showSuccess('Gasto general registrado exitosamente');
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
   * Establecer filtros
   */
  setFilters(filters: MovimientosFilters): void {
    this._filters.set(filters);
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this._filters.set({});
  }

  /**
   * Seleccionar un movimiento
   */
  select(id: string | null): void {
    this._selectedId.set(id);
  }

  // ============================================================================
  // Pagination Actions
  // ============================================================================

  /**
   * Cargar una página específica con filtros (server-side pagination)
   */
  loadPage(page: number = 1, filters?: MovimientosFilters): void {
    this._loading.set(true);
    this._error.set(null);

    const activeFilters = filters ?? this._filters();

    this.apiService.getPaginated({ page, limit: this._pageSize() }, activeFilters).subscribe({
      next: (response) => {
        this._movimientos.set(response.data);
        this._paginationMeta.set(response.meta);
        this._currentPage.set(response.meta.page);
        this._totalItems.set(response.meta.total);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar movimientos';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Navegar a una página específica
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.loadPage(page);
  }

  /**
   * Ir a la página siguiente
   */
  nextPage(): void {
    if (this.hasNextPage()) {
      this.goToPage(this._currentPage() + 1);
    }
  }

  /**
   * Ir a la página anterior
   */
  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.goToPage(this._currentPage() - 1);
    }
  }

  /**
   * Cambiar el tamaño de página y recargar desde la primera página
   */
  setPageSize(size: number): void {
    if (size <= 0 || size > 100) {
      return;
    }
    this._pageSize.set(size);
    this.loadPage(1);
  }

  /**
   * Aplicar filtros y recargar desde la primera página
   */
  applyFilters(filters: MovimientosFilters): void {
    this._filters.set(filters);
    this.loadPage(1, filters);
  }

  /**
   * Limpiar filtros y recargar desde la primera página
   */
  resetFilters(): void {
    this._filters.set({});
    this.loadPage(1, {});
  }

  /**
   * Limpiar estado
   */
  clear(): void {
    this._movimientos.set([]);
    this._reembolsosPendientes.set([]);
    this._filters.set({});
    this._loading.set(false);
    this._error.set(null);
    this._selectedId.set(null);
    // Reset pagination
    this._currentPage.set(1);
    this._pageSize.set(25);
    this._totalItems.set(0);
    this._paginationMeta.set(null);
  }
}
