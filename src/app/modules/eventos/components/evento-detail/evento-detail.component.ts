/**
 * Evento Detail Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Subject, combineLatest, firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

import { EventosStateService } from '../../services/eventos-state.service';
import { PersonasApiService } from '../../../personas/services/personas-api.service';
import { MovimientosApiService } from '../../../movimientos/services/movimientos-api.service';
import { TipoEvento, DestinoGanancia, EstadoPago } from '../../../../shared/enums';
import {
  EntregaResponse,
  Evento,
  EventoKpis,
  Movimiento,
  Persona,
  Producto,
  StockEntregaResponse,
  VentaProducto,
} from '../../../../shared/models';
import { MoneyPipe, formatMoney } from '../../../../shared/pipes/money.pipe';
import { MovimientoCardVM } from '../../../../shared/components/movimiento-card/movimiento-card.component';
import { EventoMovimientosTabComponent } from './components/evento-movimientos-tab/evento-movimientos-tab.component';
import {
  StatCardComponent,
  StatCardVariant,
} from '../../../../shared/components/stat-card/stat-card.component';
import { ProductoCardComponent } from '../../../../shared/components/producto-card/producto-card.component';
import {
  ButtonTabsComponent,
  TabConfig,
} from '../../../../shared/components/button-tabs/button-tabs.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TextFieldComponent } from '../../../../shared/components/form/text-field/text-field.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../../shared/services';
import { EntregasTabComponent } from './components/entregas-tab/entregas-tab.component';

/**
 * One row inside a VentaGroup, pre-augmented with the computed ganancia
 * so the template stays free of arithmetic.
 */
interface VentaItemView {
  ventaId: string;
  productoNombre: string;
  cantidad: number;
  ganancia: number;
}

/**
 * Visual grouping of ventas that share the same backend movimientoId.
 *
 * The backend cascade-deletes a whole lote when any of its ventas is removed,
 * so the UI must also represent the lote as a single unit. Each VentaGroup
 * is rendered as one card with all its products inside and ONE delete button.
 *
 * Ungrouped ventas (movimientoId === null, i.e. legacy rows) become a group
 * of size 1 with a synthetic key derived from the venta id.
 */
interface VentaGroup {
  /** Stable key for *ngFor / @for tracking. */
  key: string;
  /** Movimiento that backs the lote, or null for legacy individual ventas. */
  movimientoId: string | null;
  /** First venta of the group — used as the id passed to the delete endpoint. */
  primaryVentaId: string;
  /** Display name of the vendedor (taken from the first venta). */
  vendedorNombre: string;
  /** Total units across all ventas in this group. */
  totalUnidades: number;
  /** Sum of ganancia across every venta in the group. */
  gananciaTotal: number;
  /** Item rows pre-computed with ganancia per venta. */
  items: VentaItemView[];
  /** Snapshot timestamp of the first venta — used as the lote date. */
  fecha: string;
  /** True when the group is a singleton (1 venta) — enables condensed UI. */
  isSingleton: boolean;
}

interface KpiConfig {
  readonly icon: string;
  readonly title: string;
  readonly key: keyof Pick<
    EventoKpis,
    | 'totalRecaudado'
    | 'gananciaVentas'
    | 'totalRecuperado'
    | 'totalGastado'
    | 'totalPendienteReembolso'
    | 'balance'
  >;
  readonly variant: StatCardVariant;
}

const TABS_VENTA: TabConfig[] = [
  { key: 'productos', label: 'Productos', icon: 'inventory_2' },
  { key: 'ventas', label: 'Ventas', icon: 'point_of_sale' },
  { key: 'entregas', label: 'Entregas', icon: 'local_shipping' },
  { key: 'movimientos', label: 'Movimientos', icon: 'swap_horiz' },
];

/**
 * Per-product delivery progress shown as KPI cards above the tabs.
 *   "Locro 123/200" → entregado / vendido aggregated across all vendors.
 */
interface ProductoKpi {
  productoId: string;
  productoNombre: string;
  cantidadVendida: number;
  cantidadEntregada: number;
}

const TABS_GRUPO: TabConfig[] = [{ key: 'movimientos', label: 'Movimientos', icon: 'swap_horiz' }];

@Component({
  selector: 'app-evento-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    DatePipe,
    MoneyPipe,
    StatCardComponent,
    ButtonTabsComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ProductoCardComponent,
    ButtonComponent,
    TextFieldComponent,
    MatProgressSpinnerModule,
    EntregasTabComponent,
    EventoMovimientosTabComponent,
  ],
  templateUrl: './evento-detail.component.html',
  styleUrls: ['./evento-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventoDetailComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly confirmDialog = inject(ConfirmDialogService);
  readonly state = inject(EventosStateService);
  private readonly personasApi = inject(PersonasApiService);
  private readonly movimientosApi = inject(MovimientosApiService);
  private readonly notification = inject(NotificationService);

  private eventoId = '';
  private destroyed = false;
  private readonly destroy$ = new Subject<void>();
  private readonly vendedorSearch$ = new Subject<string>();
  private readonly entregaSearch$ = new Subject<string>();

  readonly vendedorSearch = signal('');
  readonly entregaSearch = signal('');

  readonly loading = this.state.loading;
  readonly togglingVisibilidad = signal(false);
  readonly cerrandoEvento = signal(false);
  readonly personas = signal<Persona[]>([]);
  readonly error = this.state.error;

  readonly evento = computed((): Evento | null => this.state.selected());

  /** Si el reporte del evento es visible públicamente (sin login). */
  readonly reportePublico = computed((): boolean => this.evento()?.reportePublico ?? false);

  readonly eventoCerrado = computed((): boolean => this.state.selected()?.estaCerrado ?? false);

  readonly eventoKpis = computed((): EventoKpis | null =>
    this.eventoId ? (this.state.kpis()[this.eventoId] ?? null) : null,
  );

  readonly eventoProductos = computed((): Producto[] =>
    this.eventoId ? (this.state.productos()[this.eventoId] ?? []) : [],
  );

  readonly eventoVentas = computed((): VentaProducto[] =>
    this.eventoId ? (this.state.ventas()[this.eventoId] ?? []) : [],
  );

  /**
   * Groups eventoVentas() by movimientoId so the UI mirrors the backend
   * cascade semantics. The vendor filter is applied server-side via
   * loadVentas(eventoId, vendedor); this computed only groups what the
   * state already holds.
   */
  readonly ventaGroups = computed((): VentaGroup[] => {
    return this._groupVentasByLote(this.eventoVentas());
  });

  readonly eventoMovimientos = computed((): Movimiento[] =>
    this.eventoId ? (this.state.movimientos()[this.eventoId] ?? []) : [],
  );

  readonly eventoEntregas = computed((): EntregaResponse[] =>
    this.eventoId ? (this.state.entregas()[this.eventoId] ?? []) : [],
  );

  readonly eventoStockEntregas = computed((): StockEntregaResponse[] =>
    this.eventoId ? (this.state.stockEntregas()[this.eventoId] ?? []) : [],
  );

  /**
   * Aggregates stock-disponible rows by productoId so each product gets a
   * single KPI card with total entregado/vendido across all vendors.
   * Empty when there are no ventas yet.
   */
  readonly productosKpis = computed((): ProductoKpi[] => {
    // Functional reduce + immutable accumulator: each iteration builds a
    // new ProductoKpi by spreading the previous total. No mutation of an
    // object that has already been stored in the Map.
    const byProducto = this.eventoStockEntregas().reduce((acc, row) => {
      const prev = acc.get(row.productoId);
      const next: ProductoKpi = prev
        ? {
            ...prev,
            cantidadVendida: prev.cantidadVendida + row.cantidadVendida,
            cantidadEntregada: prev.cantidadEntregada + row.cantidadEntregada,
          }
        : {
            productoId: row.productoId,
            productoNombre: row.productoNombre,
            cantidadVendida: row.cantidadVendida,
            cantidadEntregada: row.cantidadEntregada,
          };
      acc.set(row.productoId, next);
      return acc;
    }, new Map<string, ProductoKpi>());
    return [...byProducto.values()].sort((a, b) =>
      a.productoNombre.localeCompare(b.productoNombre),
    );
  });

  readonly deletingIdsSet = computed((): ReadonlySet<string> => this.state.deletingIds());

  readonly activeTab = signal<string>('');

  readonly tipoEvento = TipoEvento;

  readonly tabs: TabConfig[] = TABS_VENTA;

  private readonly baseKpiConfigs: readonly KpiConfig[] = [
    { icon: 'payments', title: 'Recaudado', key: 'totalRecaudado', variant: 'info' },
    { icon: 'trending_up', title: 'Ganancia Ventas', key: 'gananciaVentas', variant: 'success' },
    { icon: 'shopping_cart', title: 'Gastado', key: 'totalGastado', variant: 'warning' },
    {
      icon: 'undo',
      title: 'Reembolsos Pendientes',
      key: 'totalPendienteReembolso',
      variant: 'danger',
    },
    { icon: 'savings', title: 'Balance', key: 'balance', variant: 'primary' },
  ];

  private readonly recuperoKpiConfig: KpiConfig = {
    icon: 'account_balance',
    title: 'Costo recuperado (grupo)',
    key: 'totalRecuperado',
    variant: 'info',
  };

  /**
   * KPIs a mostrar. El "Costo recuperado" solo aplica a eventos de venta con
   * destino cuentas_personales (en otros casos el recupero es 0 y la card
   * confundiría); por eso se agrega condicionalmente.
   */
  readonly kpiConfigs = computed((): readonly KpiConfig[] => {
    const ev = this.evento();
    const aplicaRecupero =
      ev?.tipo === TipoEvento.VENTA && ev?.destinoGanancia === DestinoGanancia.CUENTAS_PERSONALES;
    return aplicaRecupero ? [...this.baseKpiConfigs, this.recuperoKpiConfig] : this.baseKpiConfigs;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.eventoId = id;
    this.state.loadById(id);
    this.state.loadKpis(id);
    this.state.loadProductos(id);
    this.state.loadVentas(id).subscribe();
    this.state.loadMovimientos(id);
    this.state.loadStockEntregas(id).subscribe();
    this.state.loadEntregas(id).subscribe();
    // Permite aterrizar en un tab puntual (ej. volver a "ventas" tras registrar
    // una venta). Sin query param, arranca en "productos".
    const tab = this.route.snapshot.queryParamMap.get('tab');
    this.activeTab.set(tab ?? 'productos');

    this.personasApi.getAll().subscribe((ps) => this.personas.set(ps));

    /**
     * switchMap auto-cancels the previous in-flight request when a newer
     * query arrives, preventing a stale "mar" response from clobbering a
     * fresher "mario" response in the state signal.
     */
    this.vendedorSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => this.state.loadVentas(this.eventoId, query.trim() || undefined)),
        takeUntil(this.destroy$),
      )
      .subscribe();

    /**
     * Entregas tab search — both requests run inside the same `combineLatest`
     * so `switchMap` cancels BOTH when a newer query arrives. Earlier, only
     * `loadStockEntregas` was returned and `loadEntregas` was a stray
     * `.subscribe()`, so a stale entregas response could overwrite a fresh
     * one if the user typed fast.
     */
    this.entregaSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          const trimmed = query.trim() || undefined;
          return combineLatest([
            this.state.loadEntregas(this.eventoId, trimmed),
            this.state.loadStockEntregas(this.eventoId, trimmed),
          ]);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.destroy$.next();
    this.destroy$.complete();
  }

  onVendedorSearchChange(value: string): void {
    this.vendedorSearch.set(value);
    this.vendedorSearch$.next(value);
  }

  onEntregaSearchChange(value: string): void {
    this.entregaSearch.set(value);
    this.entregaSearch$.next(value);
  }

  onTabChange(key: string): void {
    this.activeTab.set(key);
  }

  onEdit(): void {
    this.router.navigate(['/eventos', this.eventoId, 'editar']);
  }

  onBack(): void {
    this.router.navigate(['/eventos']);
  }

  getTabsForEvento(ev: Evento): TabConfig[] {
    return ev.tipo === TipoEvento.VENTA ? TABS_VENTA : TABS_GRUPO;
  }

  openProductoDialog(): void {
    if (this.eventoCerrado()) return;
    void import('../shared/producto-dialog/producto-dialog.component').then(
      ({ ProductoDialogComponent }) => {
        if (this.destroyed) return;
        this.dialog.open(ProductoDialogComponent, {
          width: '420px',
          maxWidth: '95vw',
          data: { eventoId: this.eventoId },
          disableClose: false,
        });
      },
    );
  }

  openIngresoDialog(): void {
    if (this.eventoCerrado()) return;
    void import('../shared/ingreso-evento-dialog/ingreso-evento-dialog.component').then(
      ({ IngresoEventoDialogComponent }) => {
        if (this.destroyed) return;
        const ref = this.dialog.open(IngresoEventoDialogComponent, {
          width: '480px',
          maxWidth: '95vw',
          data: { responsables: this.personas() },
        });
        ref.afterClosed().subscribe((result) => {
          if (result?.dto) {
            this.state.registrarIngreso(this.eventoId, result.dto).subscribe();
          }
        });
      },
    );
  }

  openGastoDialog(): void {
    if (this.eventoCerrado()) return;
    void import('../shared/gasto-evento-dialog/gasto-evento-dialog.component').then(
      ({ GastoEventoDialogComponent }) => {
        if (this.destroyed) return;
        this.dialog.open(GastoEventoDialogComponent, {
          width: '480px',
          maxWidth: '95vw',
          data: { eventoId: this.eventoId, responsables: this.personas() },
          disableClose: false,
        });
      },
    );
  }

  onRemoveProducto(productoId: string): void {
    if (this.eventoCerrado()) return;
    this.state.deleteProducto(this.eventoId, productoId).subscribe();
  }

  onDeleteVenta(ventaId: string): void {
    if (this.eventoCerrado()) return;
    this.confirmDialog.confirmDelete('venta').subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.state.deleteVenta(this.eventoId, ventaId).subscribe();
      }
    });
  }

  onDeleteMovimiento(movimientoId: string): void {
    if (this.eventoCerrado()) return;
    this.confirmDialog.confirmDelete('movimiento').subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.state.deleteMovimiento(this.eventoId, movimientoId).subscribe();
      }
    });
  }

  /**
   * Marca un gasto pendiente de reembolso como pagado. Reutiliza el mismo flujo
   * de confirmación que campamentos (ConfirmDialogService + movimientosApi.update).
   */
  onPagarReembolso(movimiento: MovimientoCardVM): void {
    if (this.eventoCerrado()) return;
    const eventoId = this.eventoId;
    this.confirmDialog
      .confirmAsync(
        'Confirmar pago de reembolso',
        '¿Confirmás que este gasto fue reembolsado?',
        () =>
          firstValueFrom(
            this.movimientosApi.update(movimiento.id, {
              estadoPago: EstadoPago.PAGADO,
            }),
          ).then(() => undefined),
        {
          icon: 'payments',
          confirmText: 'Pagar',
          cancelText: 'Cancelar',
          details: [
            { label: 'Monto', value: formatMoney(movimiento.monto) },
            {
              label: 'Descripción',
              value: movimiento.descripcion ?? 'Sin descripción',
            },
            {
              label: 'Responsable',
              value: movimiento.responsableNombre || 'Desconocido',
            },
          ],
        },
      )
      .subscribe((result) => {
        if (result.confirmed) {
          this.state.loadMovimientos(eventoId);
          this.state.loadKpis(eventoId);
        }
      });
  }

  isDeleting(id: string): boolean {
    return this.state.isDeleting(id);
  }

  /**
   * A lote group is "deleting" if its primary venta id is in the deletingIds
   * set. We pass that primary id to the backend; the backend cascades to the
   * siblings, and the loader shows on the whole card while the request runs.
   */
  isGroupDeleting(group: VentaGroup): boolean {
    return this.state.isDeleting(group.primaryVentaId);
  }

  navigateToVentasLote(): void {
    if (this.eventoCerrado()) return;
    this.router.navigate(['/eventos', this.eventoId, 'ventas', 'registrar']);
  }

  navigateToReporte(): void {
    this.router.navigate(['/eventos', this.eventoId, 'reporte']);
  }

  /** Prende/apaga la visibilidad pública del reporte de este evento. */
  toggleReportePublico(): void {
    this.togglingVisibilidad.set(true);
    this.state.updateReportePublico(this.eventoId, !this.reportePublico()).subscribe({
      complete: () => this.togglingVisibilidad.set(false),
      error: () => this.togglingVisibilidad.set(false),
    });
  }

  /** Copia al portapapeles el link público del reporte. */
  copiarLinkReporte(): void {
    const url = `${window.location.origin}/eventos/${this.eventoId}/reporte`;
    void navigator.clipboard
      .writeText(url)
      .then(() => this.notification.showSuccess('Link del reporte copiado'))
      .catch(() => this.notification.showError('No se pudo copiar el link'));
  }

  /**
   * Opens the entrega dialog. If `vendedorId` is provided, the dialog
   * preselects that vendor (used when the operator clicks "Registrar entrega"
   * on a specific vendor row).
   */
  openEntregaDialog(vendedorId?: string): void {
    if (this.eventoCerrado()) return;
    void import('../shared/entrega-dialog/entrega-dialog.component').then(
      ({ EntregaDialogComponent }) => {
        if (this.destroyed) return;
        this.dialog.open(EntregaDialogComponent, {
          width: '640px',
          maxWidth: '95vw',
          data: {
            eventoId: this.eventoId,
            stockEntregas: this.eventoStockEntregas(),
            vendedorIdPreseleccionado: vendedorId,
          },
          disableClose: false,
        });
      },
    );
  }

  onDeleteEntrega(entregaId: string): void {
    if (this.eventoCerrado()) return;
    this.confirmDialog.confirmDelete('entrega').subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.state.deleteEntrega(this.eventoId, entregaId).subscribe();
      }
    });
  }

  onCerrarEvento(): void {
    this.confirmDialog
      .confirm(
        '¿Cerrar evento?',
        'Una vez cerrado no se podrán registrar más ventas, gastos ni entregas. Esta acción es irreversible.',
      )
      .subscribe((confirmed: boolean) => {
        if (!confirmed) return;
        this.cerrandoEvento.set(true);
        this.state.cerrarEvento(this.eventoId).subscribe({
          complete: () => this.cerrandoEvento.set(false),
          error: () => this.cerrandoEvento.set(false),
        });
      });
  }

  /**
   * Pure helper that buckets ventas by their movimientoId.
   * Ventas with movimientoId === null become singleton groups keyed by the
   * venta id, so the rendering code can treat both shapes uniformly.
   *
   * Each item is pre-computed with its individual ganancia so the template
   * never does arithmetic — keeps the view a "thin projection".
   */
  private _groupVentasByLote(ventas: VentaProducto[]): VentaGroup[] {
    const groups = new Map<string, VentaGroup>();
    for (const venta of ventas) {
      const key = venta.movimientoId ?? `solo:${venta.id}`;
      const item = this._buildVentaItemView(venta);
      const existing = groups.get(key);
      if (existing) {
        groups.set(key, {
          ...existing,
          items: [...existing.items, item],
          totalUnidades: existing.totalUnidades + item.cantidad,
          gananciaTotal: existing.gananciaTotal + item.ganancia,
          isSingleton: false,
        });
        continue;
      }
      groups.set(key, {
        key,
        movimientoId: venta.movimientoId,
        primaryVentaId: venta.id,
        vendedorNombre: venta.vendedor?.nombre ?? 'Sin vendedor',
        totalUnidades: item.cantidad,
        gananciaTotal: item.ganancia,
        items: [item],
        fecha: venta.createdAt,
        isSingleton: true,
      });
    }
    return Array.from(groups.values());
  }

  /**
   * Builds the per-row view object with ganancia computed from the nested
   * producto. Falls back to 0 if precios are missing (shouldn't happen,
   * but the UI must not crash on stale data).
   */
  private _buildVentaItemView(venta: VentaProducto): VentaItemView {
    const producto = venta.producto;
    const precioVenta = Number(producto?.precioVenta ?? 0);
    const precioCosto = Number(producto?.precioCosto ?? 0);
    const ganancia = (precioVenta - precioCosto) * venta.cantidad;
    return {
      ventaId: venta.id,
      productoNombre: producto?.nombre ?? 'Producto',
      cantidad: venta.cantidad,
      ganancia,
    };
  }
}
