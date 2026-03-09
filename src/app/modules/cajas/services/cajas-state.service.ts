/**
 * Cajas State Service
 * Gestiona estado con Signals (Angular 21)
 * SIN any - tipado estricto
 */

import { Injectable, Signal, WritableSignal, computed, signal, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import {
  Caja,
  CajaConSaldo,
  Movimiento,
  CreateCajaDto,
} from '../../../shared/models';

import { Rama, RamaEnum } from '../../../shared/enums';
import { CajasApiService } from './cajas-api.service';
import { NotificationService } from '../../../shared/services';

@Injectable({
  providedIn: 'root',
})
export class CajasStateService {
  private readonly apiService = inject(CajasApiService);
  private readonly notificationService = inject(NotificationService);

  // ============================================================================
  // State Signals (private - writable)
  // ============================================================================

  private readonly _cajaGrupo: WritableSignal<CajaConSaldo | null> = signal(null);
  private readonly _cajasRama: WritableSignal<Record<string, CajaConSaldo>> = signal({});
  private readonly _movimientosGrupo: WritableSignal<Movimiento[]> = signal([]);
  private readonly _movimientosRama: WritableSignal<Record<string, Movimiento[]>> = signal({});
  private readonly _movimientosPersonal: WritableSignal<Record<string, Movimiento[]>> = signal({});
  private readonly _loading: WritableSignal<boolean> = signal(false);
  private readonly _error: WritableSignal<string | null> = signal(null);
  private readonly _selectedRama: WritableSignal<Rama | null> = signal(null);

  // ============================================================================
  // Public Readonly Signals
  // ============================================================================

  readonly cajaGrupo: Signal<CajaConSaldo | null> = this._cajaGrupo.asReadonly();
  readonly cajasRama: Signal<Record<string, CajaConSaldo>> = this._cajasRama.asReadonly();
  readonly movimientosGrupo: Signal<Movimiento[]> = this._movimientosGrupo.asReadonly();
  readonly movimientosRama: Signal<Record<string, Movimiento[]>> = this._movimientosRama.asReadonly();
  readonly movimientosPersonal: Signal<Record<string, Movimiento[]>> = this._movimientosPersonal.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  // ============================================================================
  // Computed Signals (derived state)
  // ============================================================================

  readonly saldoGrupo = computed((): number => {
    return this._cajaGrupo()?.saldo ?? 0;
  });

  readonly saldoManada = computed((): number => {
    const caja = this._cajasRama()[RamaEnum.MANADA];
    return caja?.saldo ?? 0;
  });

  readonly saldoUnidad = computed((): number => {
    const caja = this._cajasRama()[RamaEnum.UNIDAD];
    return caja?.saldo ?? 0;
  });

  readonly saldoCaminantes = computed((): number => {
    const caja = this._cajasRama()[RamaEnum.CAMINANTES];
    return caja?.saldo ?? 0;
  });

  readonly saldoRovers = computed((): number => {
    const caja = this._cajasRama()[RamaEnum.ROVERS];
    return caja?.saldo ?? 0;
  });

  readonly totalSaldosRamas = computed((): number => {
    return this.saldoManada() + this.saldoUnidad() + this.saldoCaminantes() + this.saldoRovers();
  });

  readonly totalSaldos = computed((): number => {
    return this.saldoGrupo() + this.totalSaldosRamas();
  });

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Cargar caja de grupo con saldo
   */
  loadCajaGrupo(): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getCajaGrupo().subscribe({
      next: (caja: CajaConSaldo) => {
        this._cajaGrupo.set(caja);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar caja de grupo';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Cargar caja de una rama
   */
  loadCajaRama(rama: Rama): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getById(rama).subscribe({
      next: (caja: CajaConSaldo) => {
        this._cajasRama.update((prev) => ({
          ...prev,
          [rama]: caja,
        }));
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : `Error al cargar caja de ${rama}`;
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Cargar todas las cajas de rama
   */
  loadTodasCajasRama(): void {
    this._loading.set(true);
    this._error.set(null);

    const ramas = Object.values(RamaEnum);
    const requests = ramas.map((rama) =>
      this.apiService.getById(rama).pipe(
        map((caja) => ({ rama, caja }))
      )
    );

    forkJoin(requests).subscribe({
      next: (results: Array<{ rama: RamaEnum; caja: CajaConSaldo }>) => {
        const cajasMap: Record<string, CajaConSaldo> = {};
        results.forEach(({ rama, caja }) => {
          cajasMap[rama] = caja;
        });
        this._cajasRama.set(cajasMap);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar cajas de rama';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Cargar movimientos de caja de grupo
   */
  loadMovimientosGrupo(): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getMovimientosGrupo().subscribe({
      next: (movimientos: Movimiento[]) => {
        this._movimientosGrupo.set(movimientos);
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
   * Cargar movimientos de una rama
   */
  loadMovimientosRama(rama: Rama): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getMovimientosRama(rama.toString()).subscribe({
      next: (movimientos: Movimiento[]) => {
        this._movimientosRama.update((prev) => ({
          ...prev,
          [rama]: movimientos,
        }));
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : `Error al cargar movimientos de ${rama}`;
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Cargar movimientos de cuenta personal
   */
  loadMovimientosPersonal(personaId: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getMovimientosPersonal(personaId).subscribe({
      next: (movimientos: Movimiento[]) => {
        this._movimientosPersonal.update((prev) => ({
          ...prev,
          [personaId]: movimientos,
        }));
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar movimientos personales';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Crear una nueva caja
   */
  create(dto: CreateCajaDto): Observable<Caja> {
    this._loading.set(true);
    this._error.set(null);

    return new Observable((subscriber) => {
      this.apiService.create(dto).subscribe({
        next: (caja: Caja) => {
          this._loading.set(false);
          this.notificationService.showSuccess('Caja creada exitosamente');
          subscriber.next(caja);
          subscriber.complete();
        },
        error: (err: unknown) => {
          const errorMsg = err instanceof Error ? err.message : 'Error al crear caja';
          this._error.set(errorMsg);
          this._loading.set(false);
          this.notificationService.showError(errorMsg);
          subscriber.error(err);
        },
      });
    });
  }

  /**
   * Seleccionar una rama
   */
  selectRama(rama: Rama | null): void {
    this._selectedRama.set(rama);
  }

  /**
   * Limpiar estado
   */
  clear(): void {
    this._cajaGrupo.set(null);
    this._cajasRama.set({});
    this._movimientosGrupo.set([]);
    this._movimientosRama.set({});
    this._movimientosPersonal.set({});
    this._loading.set(false);
    this._error.set(null);
    this._selectedRama.set(null);
  }
}
