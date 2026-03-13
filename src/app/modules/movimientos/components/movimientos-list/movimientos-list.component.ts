/**
 * Movimientos List Component
 * Smart Component - Lista paginada de movimientos con tabs y filtros
 * Server-side pagination con Angular Signals
 * SIN any - tipado estricto
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MovimientosStateService } from '../../services/movimientos-state.service';
import { MovimientosFilters } from '../../../../shared/models';
import {
  TipoMovimientoEnum,
  CONCEPTO_MOVIMIENTO_LABELS,
  ESTADO_PAGO_LABELS,
  MEDIO_PAGO_LABELS,
  ConceptoMovimiento,
  EstadoPago,
  MedioPago,
} from '../../../../shared/enums';
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import { TableColumn, TableData, ActionEvent } from '../../../../shared/models/table.model';
import {
  ButtonTabsComponent,
  TabConfig,
} from '../../../../shared/components/button-tabs/button-tabs.component';
import { GenericFiltersComponent } from '../../../../shared/components/filters/generic-filters/generic-filters.component';
import { FilterConfig } from '../../../../shared/components/filters/generic-filters/filter-config.interface';
import { FilterType } from '../../../../shared/components/filters/generic-filters/filter-type.enum';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';

type TabKey = 'todos' | 'ingreso' | 'egreso';

@Component({
  selector: 'app-movimientos-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    DataTableComponent,
    ButtonTabsComponent,
    GenericFiltersComponent,
  ],
  templateUrl: './movimientos-list.component.html',
  styleUrl: './movimientos-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovimientosListComponent implements OnInit {
  readonly state = inject(MovimientosStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmDialog = inject(ConfirmDialogService);

  // Expose Math for template usage
  readonly Math = Math;

  // ============================================================================
  // Tabs Configuration
  // ============================================================================

  readonly tabs: TabConfig[] = [
    { key: 'todos', label: 'Todos', icon: 'list' },
    { key: 'ingreso', label: 'Ingresos', icon: 'arrow_downward' },
    { key: 'egreso', label: 'Egresos', icon: 'arrow_upward' },
  ];

  readonly activeTab = signal<TabKey>('todos');

  // ============================================================================
  // Filter Configuration
  // ============================================================================

  readonly filterConfigs: FilterConfig[] = [
    {
      key: 'concepto',
      type: FilterType.SELECT,
      label: 'Concepto',
      placeholder: 'Todos los conceptos',
      options: [
        { value: '', label: 'Todos los conceptos' },
        ...Object.entries(CONCEPTO_MOVIMIENTO_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      ],
    },
    {
      key: 'estadoPago',
      type: FilterType.SELECT,
      label: 'Estado de Pago',
      placeholder: 'Todos los estados',
      options: [
        { value: '', label: 'Todos los estados' },
        ...Object.entries(ESTADO_PAGO_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      ],
    },
    {
      key: 'fecha',
      type: FilterType.DATE_RANGE,
      label: 'Rango de Fechas',
    },
  ];

  // ============================================================================
  // State Signals
  // ============================================================================

  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly movimientos = this.state.movimientos;

  // Pagination signals from state
  readonly currentPage = this.state.currentPage;
  readonly pageSize = this.state.pageSize;
  readonly totalItems = this.state.totalItems;
  readonly totalPages = this.state.totalPages;
  readonly hasNextPage = this.state.hasNextPage;
  readonly hasPreviousPage = this.state.hasPreviousPage;

  readonly pageSizeOptions = [10, 25, 50, 100];

  // ============================================================================
  // Table Configuration
  // ============================================================================

  // Table data computed from movimientos
  readonly tableData = computed((): TableData[] => {
    return this.movimientos().map((m) => ({
      id: m.id,
      fecha: m.fecha,
      concepto: CONCEPTO_MOVIMIENTO_LABELS[m.concepto] || m.concepto,
      descripcion: m.descripcion || '-',
      tipo: m.tipo === TipoMovimientoEnum.INGRESO ? 'Ingreso' : 'Egreso',
      tipoRaw: m.tipo,
      medioPago: MEDIO_PAGO_LABELS[m.medioPago as MedioPago] || m.medioPago,
      estadoPago: ESTADO_PAGO_LABELS[m.estadoPago] || m.estadoPago,
      caja: m.caja?.nombre || '-',
      responsable: m.responsable?.nombre ?? '-',
      comprobante: m.comprobanteEntregado ? 'Sí' : 'No',
      monto: m.monto,
    }));
  });

  // Dynamic columns based on active tab
  readonly tableColumns = computed((): TableColumn[] => {
    const isAllTab = this.activeTab() === 'todos';

    const baseColumns: TableColumn[] = [
      { key: 'fecha', header: 'Fecha', type: 'date', sortable: true },
    ];

    // Only show "Tipo" column in "Todos" tab
    if (isAllTab) {
      baseColumns.push({
        key: 'tipo',
        header: 'Tipo',
        type: 'status',
        sortable: true,
      });
    }

    return [
      ...baseColumns,
      { key: 'concepto', header: 'Concepto', type: 'text', sortable: true },
      { key: 'descripcion', header: 'Descripción', type: 'text' },
      {
        key: 'monto',
        header: 'Monto',
        type: 'number',
        sortable: true,
        formatter: (value: unknown) =>
          `$${(value as number).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
      },
      { key: 'medioPago', header: 'Medio de Pago', type: 'text' },
      { key: 'estadoPago', header: 'Estado', type: 'status' },
      { key: 'caja', header: 'Caja', type: 'text' },
      { key: 'responsable', header: 'Responsable', type: 'text' },
      { key: 'comprobante', header: 'Comprobante', type: 'text' },
      {
        key: 'actions',
        header: 'Acciones',
        type: 'action',
        actions: [
          { key: 'view', label: 'Ver', icon: 'visibility', tooltip: 'Ver detalle' },
          { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar' },
          {
            key: 'delete',
            label: 'Eliminar',
            icon: 'delete',
            className: 'text-red-600',
            tooltip: 'Eliminar',
          },
        ],
      },
    ];
  });

  // ============================================================================
  // Lifecycle
  // ============================================================================

  ngOnInit(): void {
    // Handle query params with proper cleanup
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const filters: MovimientosFilters = {};
      if (params['cajaId']) filters.cajaId = params['cajaId'];
      if (params['tipo']) {
        filters.tipo = params['tipo'];
        // Set active tab based on query param
        if (params['tipo'] === TipoMovimientoEnum.INGRESO) {
          this.activeTab.set('ingreso');
        } else if (params['tipo'] === TipoMovimientoEnum.EGRESO) {
          this.activeTab.set('egreso');
        }
      }
      if (params['concepto']) filters.concepto = params['concepto'];
      if (params['fechaInicio']) filters.fechaInicio = params['fechaInicio'];
      if (params['fechaFin']) filters.fechaFin = params['fechaFin'];
      this.state.setFilters(filters);
    });

    // Load first page with server-side pagination
    this.state.loadPage(1);
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  onTabChange(tabKey: string): void {
    this.activeTab.set(tabKey as TabKey);

    // Update filters based on selected tab
    const currentFilters = this.state.filters();
    const newFilters: MovimientosFilters = { ...currentFilters };

    if (tabKey === 'todos') {
      delete newFilters.tipo;
    } else if (tabKey === 'ingreso') {
      newFilters.tipo = TipoMovimientoEnum.INGRESO;
    } else if (tabKey === 'egreso') {
      newFilters.tipo = TipoMovimientoEnum.EGRESO;
    }

    // Apply filters and reload from page 1
    this.state.applyFilters(newFilters);
  }

  onFiltersChanged(filters: Record<string, unknown>): void {
    const newFilters: MovimientosFilters = {};

    // Map filter values to MovimientosFilters
    if (filters['concepto'] && filters['concepto'] !== '') {
      newFilters.concepto = filters['concepto'] as ConceptoMovimiento;
    }
    if (filters['estadoPago'] && filters['estadoPago'] !== '') {
      newFilters.estadoPago = filters['estadoPago'] as EstadoPago;
    }

    // Handle date range
    const fechaRange = filters['fecha'] as { startDate?: string; endDate?: string } | undefined;
    if (fechaRange) {
      if (fechaRange.startDate) newFilters.fechaInicio = fechaRange.startDate;
      if (fechaRange.endDate) newFilters.fechaFin = fechaRange.endDate;
    }

    // Preserve tipo filter from active tab
    const activeTab = this.activeTab();
    if (activeTab === 'ingreso') {
      newFilters.tipo = TipoMovimientoEnum.INGRESO;
    } else if (activeTab === 'egreso') {
      newFilters.tipo = TipoMovimientoEnum.EGRESO;
    }

    this.state.applyFilters(newFilters);
  }

  onFilterCleared(): void {
    // Preserve tipo filter from active tab
    const activeTab = this.activeTab();
    const filters: MovimientosFilters = {};

    if (activeTab === 'ingreso') {
      filters.tipo = TipoMovimientoEnum.INGRESO;
    } else if (activeTab === 'egreso') {
      filters.tipo = TipoMovimientoEnum.EGRESO;
    }

    this.state.applyFilters(filters);
  }

  onPageChange(page: number): void {
    this.state.goToPage(page);
  }

  onPageSizeChange(size: number): void {
    this.state.setPageSize(size);
  }

  onNuevoMovimiento(): void {
    this.router.navigate(['/movimientos/nuevo']);
  }

  onActionClick(event: ActionEvent): void {
    const id = event.row['id'];
    if (typeof id !== 'string') return;

    switch (event.action) {
      case 'view':
        this.router.navigate(['/movimientos', id]);
        break;
      case 'edit':
        this.router.navigate(['/movimientos', id, 'editar']);
        break;
      case 'delete':
        this.handleDelete(id);
        break;
    }
  }

  private handleDelete(id: string): void {
    this.confirmDialog
      .delete('movimiento', () => this.state.delete(id))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result.deleted) {
          // Reload current page after deletion
          this.state.loadPage(this.currentPage());
        }
      });
  }

  // Row click only navigates via "Ver" action button, not on row click
  onRowClick(_row: TableData): void {
    // Disabled: navigation only through action buttons
  }
}
