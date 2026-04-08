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
import { from, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { EventosStateService } from '../../services/eventos-state.service';
import { PersonasApiService } from '../../../personas/services/personas-api.service';
import { TipoEvento } from '../../../../shared/enums';
import {
  Evento,
  EventoKpis,
  Persona,
  Producto,
  VentaProducto,
  ResumenVentas,
} from '../../../../shared/models';
import { TableColumn, TableData } from '../../../../shared/models/table.model';
import {
  StatCardComponent,
  StatCardVariant,
} from '../../../../shared/components/stat-card/stat-card.component';
import { ProductoCardComponent } from '../../../../shared/components/producto-card/producto-card.component';
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import {
  ButtonTabsComponent,
  TabConfig,
} from '../../../../shared/components/button-tabs/button-tabs.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TextFieldComponent } from '../../../../shared/components/form/text-field/text-field.component';

interface KpiConfig {
  readonly icon: string;
  readonly title: string;
  readonly key: keyof Pick<
    EventoKpis,
    'totalIngresos' | 'totalGastado' | 'totalPendienteReembolso' | 'balance'
  >;
  readonly variant: StatCardVariant;
}

const TABS_VENTA: TabConfig[] = [
  { key: 'productos', label: 'Productos', icon: 'inventory_2' },
  { key: 'ventas', label: 'Ventas', icon: 'point_of_sale' },
  { key: 'movimientos', label: 'Movimientos', icon: 'swap_horiz' },
];

const TABS_GRUPO: TabConfig[] = [{ key: 'movimientos', label: 'Movimientos', icon: 'swap_horiz' }];

@Component({
  selector: 'app-evento-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    DatePipe,
    StatCardComponent,
    ButtonTabsComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ProductoCardComponent,
    DataTableComponent,
    ButtonComponent,
    TextFieldComponent,
  ],
  templateUrl: './evento-detail.component.html',
  styleUrls: ['./evento-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventoDetailComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  readonly state = inject(EventosStateService);
  private readonly personasApi = inject(PersonasApiService);

  private eventoId = '';
  private readonly destroy$ = new Subject<void>();
  private readonly vendedorSearch$ = new Subject<string>();

  readonly vendedorSearch = signal('');

  readonly loading = this.state.loading;
  readonly personas = signal<Persona[]>([]);
  readonly error = this.state.error;

  readonly evento = computed((): Evento | null => this.state.selected());

  readonly eventoKpis = computed((): EventoKpis | null =>
    this.eventoId ? (this.state.kpis()[this.eventoId] ?? null) : null,
  );

  readonly eventoProductos = computed((): Producto[] =>
    this.eventoId ? (this.state.productos()[this.eventoId] ?? []) : [],
  );

  readonly eventoVentas = computed((): VentaProducto[] =>
    this.eventoId ? (this.state.ventas()[this.eventoId] ?? []) : [],
  );

  readonly eventoResumenVentas = computed((): ResumenVentas | null =>
    this.eventoId ? (this.state.resumenVentas()[this.eventoId] ?? null) : null,
  );

  readonly activeTab = signal<string>('');

  readonly tipoEvento = TipoEvento;

  readonly tabs: TabConfig[] = TABS_VENTA;

  readonly kpiConfigs: readonly KpiConfig[] = [
    { icon: 'payments', title: 'Ingresos', key: 'totalIngresos', variant: 'info' },
    { icon: 'shopping_cart', title: 'Gastado', key: 'totalGastado', variant: 'warning' },
    {
      icon: 'undo',
      title: 'Reembolsos Pendientes',
      key: 'totalPendienteReembolso',
      variant: 'danger',
    },
    { icon: 'savings', title: 'Balance', key: 'balance', variant: 'primary' },
  ];

  readonly ventasColumns: TableColumn[] = [
    { key: 'vendedor', header: 'Vendedor', type: 'text', sortable: true },
    { key: 'producto', header: 'Producto', type: 'text', sortable: true },
    { key: 'cantidad', header: 'Cantidad', type: 'number', sortable: true },
    {
      key: 'ganancia',
      header: 'Ganancia',
      type: 'text',
      formatter: (value) =>
        new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value as number),
    },
  ];

  readonly ventasTableData = computed((): TableData[] => {
    const resumen = this.eventoResumenVentas();
    if (!resumen) return [];
    return resumen.ventasPorVendedor.flatMap((v) =>
      v.desglose.map((d) => ({
        vendedor: v.vendedorNombre,
        producto: d.nombreProducto,
        cantidad: d.cantidad,
        ganancia: d.ganancia,
      })),
    );
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.eventoId = id;
    this.state.loadById(id);
    this.state.loadKpis(id);
    this.state.loadProductos(id);
    this.state.loadVentas(id);
    this.state.loadResumenVentas(id);
    this.activeTab.set('productos');

    this.personasApi.getAll().subscribe((ps) => this.personas.set(ps));

    this.vendedorSearch$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.state.loadResumenVentas(this.eventoId, query || undefined);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onVendedorSearchChange(value: string): void {
    this.vendedorSearch.set(value);
    this.vendedorSearch$.next(value);
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
    from(
      import('../shared/producto-dialog/producto-dialog.component').then(
        ({ ProductoDialogComponent }) => {
          this.dialog.open(ProductoDialogComponent, {
            width: '420px',
            maxWidth: '95vw',
            data: { eventoId: this.eventoId },
            disableClose: false,
          });
        },
      ),
    ).subscribe();
  }

  openIngresoDialog(): void {
    from(
      import('../shared/ingreso-evento-dialog/ingreso-evento-dialog.component').then(
        ({ IngresoEventoDialogComponent }) => {
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
      ),
    ).subscribe();
  }

  openGastoDialog(): void {
    from(
      import('../shared/gasto-evento-dialog/gasto-evento-dialog.component').then(
        ({ GastoEventoDialogComponent }) => {
          const ref = this.dialog.open(GastoEventoDialogComponent, {
            width: '480px',
            maxWidth: '95vw',
            data: { responsables: this.personas() },
          });
          ref.afterClosed().subscribe((result) => {
            if (result?.dto) {
              this.state.registrarGasto(this.eventoId, result.dto).subscribe();
            }
          });
        },
      ),
    ).subscribe();
  }

  openCerrarDialog(): void {
    from(
      import('../shared/cerrar-evento-dialog/cerrar-evento-dialog.component').then(
        ({ CerrarEventoDialogComponent }) => {
          const ref = this.dialog.open(CerrarEventoDialogComponent, {
            width: '480px',
            maxWidth: '95vw',
            data: {
              eventoId: this.eventoId,
              nombreEvento: this.evento()?.nombre ?? '',
              kpis: this.eventoKpis(),
            },
          });
          ref.afterClosed().subscribe((result) => {
            if (result?.dto) {
              this.state.cerrarEvento(this.eventoId, result.dto).subscribe({
                next: () => this.router.navigate(['/eventos']),
              });
            }
          });
        },
      ),
    ).subscribe();
  }

  onRemoveProducto(productoId: string): void {
    this.state.deleteProducto(this.eventoId, productoId).subscribe();
  }

  navigateToVentasLote(): void {
    this.router.navigate(['/eventos', this.eventoId, 'ventas', 'registrar']);
  }
}
