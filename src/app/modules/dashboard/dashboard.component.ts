/**
 * Dashboard Component
 * Smart Component - Página principal con resumen financiero
 * Conectado a servicios reales para datos dinámicos
 */

import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
  DestroyRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, map, catchError, of } from 'rxjs';

import {
  StatCardComponent,
  StatCardVariant,
  DataListCardComponent,
  DataListItemComponent,
  IconVariant,
  ActionButtonComponent,
  ActionButtonVariant,
  EventListItemComponent,
  EventCategoryConfig,
} from '../../shared';

import { CajasStateService } from '../cajas/services/cajas-state.service';
import { CajasApiService } from '../cajas/services/cajas-api.service';
import { EventosApiService } from '../eventos/services/eventos-api.service';
import { PersonasApiService } from '../personas/services/personas-api.service';

import { Movimiento, Evento, PersonaUnion } from '../../shared/models';
import { TipoMovimientoEnum, RamaEnum, TipoEvento } from '../../shared/enums';
import { humanize } from '../../shared/pipes';
import type { Rama } from '../../shared/enums';

// ============================================================================
// Config Interfaces
// ============================================================================

interface StatConfig {
  readonly icon: string;
  readonly title: string;
  readonly value: number;
  readonly variant: StatCardVariant;
}

interface MovimientoConfig {
  readonly icon: string;
  readonly iconVariant: IconVariant;
  readonly concepto: string;
  readonly detalle: string;
  readonly monto: number;
}

interface FondoRamaConfig {
  readonly icon: string;
  readonly iconVariant: IconVariant;
  readonly nombre: string;
  readonly protagonistas: number;
  readonly saldo: number;
}

interface QuickActionConfig {
  readonly icon: string;
  readonly label: string;
  readonly route: string;
  readonly variant: ActionButtonVariant;
}

interface UpcomingEventConfig {
  readonly id: string;
  readonly titulo: string;
  readonly fecha: Date;
  readonly categoria: EventCategoryConfig;
}

// ============================================================================
// Constants
// ============================================================================

const RAMA_CONFIG: Record<Rama, { icon: string; iconVariant: IconVariant }> = {
  [RamaEnum.MANADA]: { icon: 'pets', iconVariant: 'warning' },
  [RamaEnum.UNIDAD]: { icon: 'explore', iconVariant: 'info' },
  [RamaEnum.CAMINANTES]: { icon: 'hiking', iconVariant: 'success' },
  [RamaEnum.ROVERS]: { icon: 'landscape', iconVariant: 'danger' },
};

const EVENT_CATEGORY_STYLES: Record<TipoEvento, EventCategoryConfig> = {
  [TipoEvento.VENTA]: {
    label: 'Venta',
    backgroundColor: '#e8f5e9',
    textColor: '#2e7d32',
  },
  [TipoEvento.GRUPO]: {
    label: 'Grupo',
    backgroundColor: '#e3f2fd',
    textColor: '#1565c0',
  },
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    StatCardComponent,
    DataListCardComponent,
    DataListItemComponent,
    ActionButtonComponent,
    EventListItemComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  // ============================================================================
  // Dependency Injection
  // ============================================================================

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cajasState = inject(CajasStateService);
  private readonly cajasApi = inject(CajasApiService);
  private readonly eventosApi = inject(EventosApiService);
  private readonly personasApi = inject(PersonasApiService);

  // ============================================================================
  // State Signals
  // ============================================================================

  private readonly _movimientosRecientes = signal<Movimiento[]>([]);
  private readonly _proximosEventos = signal<Evento[]>([]);
  private readonly _protagonistasPorRama = signal<Record<Rama, number>>({
    [RamaEnum.MANADA]: 0,
    [RamaEnum.UNIDAD]: 0,
    [RamaEnum.CAMINANTES]: 0,
    [RamaEnum.ROVERS]: 0,
  });
  private readonly _isLoading = signal<boolean>(true);

  // ============================================================================
  // Computed Signals - Stats KPIs
  // ============================================================================

  readonly stats = computed<readonly StatConfig[]>(() => [
    {
      icon: 'account_balance',
      title: 'Caja de Grupo',
      value: this.cajasState.saldoGrupo(),
      variant: 'success' as const,
    },
    {
      icon: 'savings',
      title: 'Fondos de Rama',
      value: this.cajasState.totalSaldosRamas(),
      variant: 'info' as const,
    },
    {
      icon: 'person',
      title: 'Cuentas Personales',
      value: this.cajasState.totalCuentasPersonales(),
      variant: 'warning' as const,
    },
    {
      icon: 'receipt_long',
      title: 'Reembolsos Pendientes',
      value: this.cajasState.totalReembolsosPendientes(),
      variant: 'danger' as const,
    },
  ]);

  // ============================================================================
  // Computed Signals - Lists
  // ============================================================================

  readonly movimientosRecientes = computed<readonly MovimientoConfig[]>(() => {
    const movimientos = this._movimientosRecientes();
    return movimientos.slice(0, 5).map((mov) => this.mapMovimientoToConfig(mov));
  });

  readonly fondosRama = computed<readonly FondoRamaConfig[]>(() => {
    const cajasRama = this.cajasState.cajasRama();
    const protagonistasPorRama = this._protagonistasPorRama();

    return (Object.values(RamaEnum) as Rama[])
      .filter((rama) => cajasRama[rama])
      .map((rama) => {
        const caja = cajasRama[rama];
        const config = RAMA_CONFIG[rama];
        return {
          icon: config.icon,
          iconVariant: config.iconVariant,
          nombre: rama,
          protagonistas: protagonistasPorRama[rama] ?? 0,
          saldo: caja?.saldoActual ?? 0,
        };
      });
  });

  readonly proximosEventos = computed<readonly UpcomingEventConfig[]>(() => {
    const eventos = this._proximosEventos();
    const now = new Date();

    return eventos
      .filter((evento) => new Date(evento.fecha) >= now)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 3)
      .map((evento) => ({
        id: evento.id,
        titulo: evento.nombre,
        fecha: new Date(evento.fecha),
        categoria: EVENT_CATEGORY_STYLES[evento.tipo] ?? EVENT_CATEGORY_STYLES[TipoEvento.GRUPO],
      }));
  });

  // ============================================================================
  // Static Config - Quick Actions
  // ============================================================================

  readonly quickActions: readonly QuickActionConfig[] = [
    {
      icon: 'person_add',
      label: 'Registrar Inscripción',
      route: '/inscripciones/crear',
      variant: 'primary',
    },
    {
      icon: 'event',
      label: 'Crear Evento',
      route: '/eventos/crear',
      variant: 'info',
    },
    {
      icon: 'receipt_long',
      label: 'Registrar Gasto',
      route: '/movimientos/nuevo',
      variant: 'success',
    },
    {
      icon: 'assessment',
      label: 'Ver Reportes',
      route: '/reportes',
      variant: 'warning',
    },
  ];

  // ============================================================================
  // Public Signals
  // ============================================================================

  readonly isLoading = this._isLoading.asReadonly();

  // ============================================================================
  // Lifecycle
  // ============================================================================

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // ============================================================================
  // Data Loading
  // ============================================================================

  private loadDashboardData(): void {
    this._isLoading.set(true);

    // Load consolidated cajas data (replaces multiple individual API calls)
    this.cajasState.loadConsolidado();

    // Load eventos and personas in parallel (not part of consolidado endpoint)
    forkJoin({
      eventos: this.eventosApi.getAll().pipe(catchError(() => of([]))),
      personas: this.personasApi.getAll().pipe(catchError(() => of([]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ eventos, personas }) => {
          // Set eventos
          this._proximosEventos.set(eventos);

          // Count protagonistas per rama
          this.countProtagonistasPerRama(personas);

          this._isLoading.set(false);
        },
        error: () => {
          this._isLoading.set(false);
        },
      });

    // Load movimientos for grupo caja
    this.loadMovimientosRecientes();
  }

  private loadMovimientosRecientes(): void {
    // First ensure caja grupo is loaded, then get movimientos
    this.cajasApi
      .getCajaGrupo()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((caja) => caja.id),
        catchError(() => of(null)),
      )
      .subscribe((cajaId) => {
        if (cajaId) {
          this.cajasApi
            .getMovimientos(cajaId)
            .pipe(
              takeUntilDestroyed(this.destroyRef),
              catchError(() => of([])),
            )
            .subscribe((movimientos) => {
              // Sort by date descending and take first 5
              const sorted = [...movimientos].sort(
                (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
              );
              this._movimientosRecientes.set(sorted);
            });
        }
      });
  }

  private countProtagonistasPerRama(personas: PersonaUnion[]): void {
    const counts: Record<Rama, number> = {
      [RamaEnum.MANADA]: 0,
      [RamaEnum.UNIDAD]: 0,
      [RamaEnum.CAMINANTES]: 0,
      [RamaEnum.ROVERS]: 0,
    };

    personas.forEach((persona) => {
      if (persona.tipo === 'protagonista' && 'rama' in persona && persona.rama) {
        const rama = persona.rama as Rama;
        if (counts[rama] !== undefined) {
          counts[rama]++;
        }
      }
    });

    this._protagonistasPorRama.set(counts);
  }

  // ============================================================================
  // Mappers
  // ============================================================================

  private mapMovimientoToConfig(mov: Movimiento): MovimientoConfig {
    const isIngreso = mov.tipo === TipoMovimientoEnum.INGRESO;
    const fecha = new Date(mov.fecha);
    const fechaStr = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;

    return {
      icon: isIngreso ? 'north' : 'south',
      iconVariant: isIngreso ? 'success' : 'danger',
      concepto: humanize(mov.descripcion ?? mov.concepto, 'none'),
      detalle: `${mov.responsable?.nombre ?? 'Sistema'} • ${fechaStr}`,
      monto: isIngreso ? mov.monto : -mov.monto,
    };
  }

  // ============================================================================
  // Event Handlers - Navigation
  // ============================================================================

  onVerMasMovimientos(): void {
    this.router.navigate(['/movimientos']);
  }

  onQuickAction(route: string): void {
    this.router.navigate([route]);
  }

  onVerTodosEventos(): void {
    this.router.navigate(['/eventos']);
  }

  onEventoClick(id: string): void {
    this.router.navigate(['/eventos', id]);
  }
}
