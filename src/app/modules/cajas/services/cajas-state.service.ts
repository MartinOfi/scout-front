/**
 * Cajas State Service
 * Gestiona estado con Signals (Angular 21)
 * SIN any - tipado estricto
 *
 * Uses correct API endpoints:
 * - GET /cajas - List all cajas
 * - GET /cajas?tipo={tipo} - Get cajas by type
 * - GET /cajas/grupo - Get caja de grupo
 * - GET /movimientos/saldo/:cajaId - Get saldo of a caja
 * - GET /movimientos/caja/:cajaId - Get movimientos of a caja
 */

import { Injectable, Signal, WritableSignal, computed, signal, inject } from '@angular/core';
import { Observable, forkJoin, map, switchMap, of } from 'rxjs';

import {
  Caja,
  CajaConSaldo,
  Movimiento,
  CreateCajaDto,
} from '../../../shared/models';

import { Rama, RamaEnum, CajaType } from '../../../shared/enums';
import { CajasApiService } from './cajas-api.service';
import { NotificationService } from '../../../shared/services';

/** Map Rama enum to CajaType for fondo de rama */
const RAMA_TO_CAJA_TYPE: Record<Rama, CajaType> = {
  [RamaEnum.MANADA]: CajaType.RAMA_MANADA,
  [RamaEnum.UNIDAD]: CajaType.RAMA_UNIDAD,
  [RamaEnum.CAMINANTES]: CajaType.RAMA_CAMINANTES,
  [RamaEnum.ROVERS]: CajaType.RAMA_ROVERS,
};

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
   * Uses GET /cajas?tipo={cajaType} to get the caja
   */
  loadCajaRama(rama: Rama): void {
    this._loading.set(true);
    this._error.set(null);

    const cajaType = RAMA_TO_CAJA_TYPE[rama];
    this.apiService.getByType(cajaType).pipe(
      map((cajas) => cajas[0] as CajaConSaldo | undefined)
    ).subscribe({
      next: (caja: CajaConSaldo | undefined) => {
        if (caja) {
          this._cajasRama.update((prev) => ({
            ...prev,
            [rama]: caja,
          }));
        }
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
   * Uses GET /cajas?tipo={cajaType} for each rama
   */
  loadTodasCajasRama(): void {
    this._loading.set(true);
    this._error.set(null);

    const ramas = Object.values(RamaEnum) as Rama[];
    const requests = ramas.map((rama) => {
      const cajaType = RAMA_TO_CAJA_TYPE[rama];
      return this.apiService.getByType(cajaType).pipe(
        map((cajas) => ({ rama, caja: cajas[0] as CajaConSaldo | undefined }))
      );
    });

    forkJoin(requests).subscribe({
      next: (results) => {
        const cajasMap: Record<string, CajaConSaldo> = {};
        results.forEach(({ rama, caja }) => {
          if (caja) {
            cajasMap[rama] = caja;
          }
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
   * First gets the grupo caja, then fetches its movimientos by ID
   */
  loadMovimientosGrupo(): void {
    this._loading.set(true);
    this._error.set(null);

    // If we already have cajaGrupo loaded, use its ID
    const cajaGrupo = this._cajaGrupo();
    if (cajaGrupo) {
      this.apiService.getMovimientos(cajaGrupo.id).subscribe({
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
    } else {
      // First load the caja grupo, then get movimientos
      this.apiService.getCajaGrupo().pipe(
        switchMap((caja: CajaConSaldo) => {
          this._cajaGrupo.set(caja);
          return this.apiService.getMovimientos(caja.id);
        })
      ).subscribe({
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
  }

  /**
   * Cargar movimientos de una rama
   * First gets the rama caja by type, then fetches its movimientos by ID
   */
  loadMovimientosRama(rama: Rama): void {
    this._loading.set(true);
    this._error.set(null);

    // Check if we already have this caja loaded
    const existingCaja = this._cajasRama()[rama];
    if (existingCaja) {
      this.apiService.getMovimientos(existingCaja.id).subscribe({
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
    } else {
      // First load the caja, then get movimientos
      const cajaType = RAMA_TO_CAJA_TYPE[rama];
      this.apiService.getByType(cajaType).pipe(
        switchMap((cajas) => {
          const caja = cajas[0] as CajaConSaldo | undefined;
          if (!caja) {
            return of([]);
          }
          this._cajasRama.update((prev) => ({
            ...prev,
            [rama]: caja,
          }));
          return this.apiService.getMovimientos(caja.id);
        })
      ).subscribe({
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
  }

  /**
   * Cargar movimientos de cuenta personal by caja ID
   */
  loadMovimientosPersonal(cajaId: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getMovimientos(cajaId).subscribe({
      next: (movimientos: Movimiento[]) => {
        this._movimientosPersonal.update((prev) => ({
          ...prev,
          [cajaId]: movimientos,
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
