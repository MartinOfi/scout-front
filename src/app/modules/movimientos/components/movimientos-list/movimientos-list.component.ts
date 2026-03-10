/**
 * Movimientos List Component
 * Smart Component - max 200 líneas
 * Lista de movimientos con filtros
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MovimientosStateService } from '../../services/movimientos-state.service';
import { MovimientosFilters } from '../../../../shared/models';
import { TipoMovimientoEnum, CONCEPTO_MOVIMIENTO_LABELS, ESTADO_PAGO_LABELS } from '../../../../shared/enums';
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import { TableColumn, TableData, ActionEvent } from '../../../../shared/models/table.model';

// Dumb Components
import { MovimientoFiltersComponent } from './components/movimiento-filters/movimiento-filters.component';

@Component({
  selector: 'app-movimientos-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DataTableComponent,
    MovimientoFiltersComponent
  ],
  templateUrl: './movimientos-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovimientosListComponent implements OnInit {
  private readonly state = inject(MovimientosStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signals del estado
  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly totalIngresos = this.state.totalIngresos;
  readonly totalEgresos = this.state.totalEgresos;
  readonly saldoNeto = this.state.saldoNeto;

  // Table data computed from movimientos
  readonly tableData = computed((): TableData[] => {
    return this.state.filtered().map(m => ({
      id: m.id,
      fecha: m.fecha,
      concepto: CONCEPTO_MOVIMIENTO_LABELS[m.concepto] || m.concepto,
      descripcion: m.descripcion || '',
      tipo: m.tipo === TipoMovimientoEnum.INGRESO ? 'Ingreso' : 'Egreso',
      tipoRaw: m.tipo,
      estadoPago: ESTADO_PAGO_LABELS[m.estadoPago] || m.estadoPago,
      monto: m.monto
    }));
  });

  readonly tableColumns: TableColumn[] = [
    { key: 'fecha', header: 'Fecha', type: 'date', sortable: true },
    { key: 'concepto', header: 'Concepto', type: 'text', sortable: true },
    { key: 'descripcion', header: 'Descripción', type: 'text' },
    { key: 'tipo', header: 'Tipo', type: 'status', sortable: true },
    { key: 'estadoPago', header: 'Estado', type: 'status' },
    { key: 'monto', header: 'Monto', type: 'number', sortable: true,
      formatter: (value: unknown) => `$${(value as number).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` },
    {
      key: 'actions',
      header: 'Acciones',
      type: 'action',
      actions: [
        { key: 'view', label: 'Ver', icon: 'visibility', tooltip: 'Ver detalle' },
        { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar' },
        { key: 'delete', label: 'Eliminar', icon: 'delete', className: 'text-red-600', tooltip: 'Eliminar' }
      ]
    }
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const filters: MovimientosFilters = {};
      if (params['cajaId']) filters.cajaId = params['cajaId'];
      if (params['tipo']) filters.tipo = params['tipo'];
      if (params['concepto']) filters.concepto = params['concepto'];
      if (params['fechaInicio']) filters.fechaInicio = params['fechaInicio'];
      if (params['fechaFin']) filters.fechaFin = params['fechaFin'];
      this.state.setFilters(filters);
    });
    this.state.load();
  }

  onFilterChange(filters: MovimientosFilters): void {
    this.state.setFilters(filters);
  }

  onClearFilters(): void {
    this.state.clearFilters();
  }

  onNuevoMovimiento(): void {
    this.router.navigate(['/movimientos/nuevo']);
  }

  onActionClick(event: ActionEvent): void {
    const id = event.row['id'] as string;
    switch (event.action) {
      case 'view':
        this.router.navigate(['/movimientos', id]);
        break;
      case 'edit':
        this.router.navigate(['/movimientos', id, 'editar']);
        break;
      case 'delete':
        if (confirm('¿Estás seguro de eliminar este movimiento?')) {
          this.state.delete(id).subscribe();
        }
        break;
    }
  }

  onRowClick(row: TableData): void {
    this.router.navigate(['/movimientos', row['id']]);
  }
}
