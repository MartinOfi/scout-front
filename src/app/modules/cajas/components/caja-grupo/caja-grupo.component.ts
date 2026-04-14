/**
 * Caja Grupo Component
 * Smart Component - max 200 líneas
 * Gestiona la caja principal del grupo scout
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { TransferenciaDialogComponent } from '../../../movimientos/components/transferencia-dialog/transferencia-dialog.component';

import { CajasStateService } from '../../services/cajas-state.service';
import { CajaConSaldo, Movimiento } from '../../../../shared/models';

// Shared Components
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import { GenericFiltersComponent } from '../../../../shared/components/filters/generic-filters/generic-filters.component';
import { TableColumn, ActionEvent } from '../../../../shared/models/table.model';
import { FilterConfig } from '../../../../shared/components/filters/generic-filters/filter-config.interface';
import { FilterType } from '../../../../shared/components/filters/generic-filters/filter-type.enum';
import {
  CONCEPTO_MOVIMIENTO_LABELS,
  ConceptoMovimiento,
  TipoMovimientoEnum,
} from '../../../../shared/enums/movimiento.enum';
import { RAMA_LABELS, RamaEnum } from '../../../../shared/enums/persona.enum';

@Component({
  selector: 'app-caja-grupo',
  standalone: true,
  imports: [
    CommonModule,
    SlicePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    StatCardComponent,
    ActionButtonComponent,
    DataTableComponent,
    GenericFiltersComponent,
  ],
  templateUrl: './caja-grupo.component.html',
  styleUrls: ['./caja-grupo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CajaGrupoComponent implements OnInit {
  private readonly state = inject(CajasStateService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // Signals del estado
  readonly cajaGrupo = this.state.cajaGrupo;
  readonly saldoGrupo = this.state.saldoGrupo;
  readonly movimientosGrupo = this.state.movimientosGrupo;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  // Table configuration
  readonly movimientosColumns: TableColumn[] = [
    { key: 'fecha', header: 'Fecha', type: 'date', sortable: true },
    { key: 'concepto', header: 'Concepto', type: 'concepto', sortable: true },
    { key: 'tipo', header: 'Tipo', type: 'status' },
    { key: 'monto', header: 'Monto', type: 'number', sortable: true },
    {
      key: 'actions',
      header: 'Acciones',
      type: 'action',
      actions: [{ key: 'view', label: 'Ver', icon: 'visibility' }],
    },
  ];

  // Filter configuration
  readonly filterConfigs: FilterConfig[] = [
    {
      key: 'tipo',
      type: FilterType.SELECT,
      label: 'Tipo',
      placeholder: 'Todos',
      options: [
        { value: '', label: 'Todos' },
        { value: TipoMovimientoEnum.INGRESO, label: 'Ingresos' },
        { value: TipoMovimientoEnum.EGRESO, label: 'Egresos' },
      ],
    },
    {
      key: 'fecha',
      type: FilterType.DATE_RANGE,
      label: 'Fecha',
    },
    {
      key: 'rama',
      type: FilterType.SELECT,
      label: 'Rama',
      placeholder: 'Todas',
      options: [
        { value: '', label: 'Todas las ramas' },
        { value: RamaEnum.MANADA, label: RAMA_LABELS[RamaEnum.MANADA] },
        { value: RamaEnum.UNIDAD, label: RAMA_LABELS[RamaEnum.UNIDAD] },
        { value: RamaEnum.CAMINANTES, label: RAMA_LABELS[RamaEnum.CAMINANTES] },
        { value: RamaEnum.ROVERS, label: RAMA_LABELS[RamaEnum.ROVERS] },
        { value: 'educadores', label: 'Educadores' },
      ],
    },
    {
      key: 'concepto',
      type: FilterType.SELECT,
      label: 'Concepto',
      placeholder: 'Todos',
      options: [
        { value: '', label: 'Todos los conceptos' },
        ...Object.entries(CONCEPTO_MOVIMIENTO_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      ],
    },
  ];

  ngOnInit(): void {
    this.state.loadCajaGrupo();
    this.state.loadMovimientosGrupo();
  }

  onVerTodosMovimientos(): void {
    this.router.navigate(['/movimientos'], {
      queryParams: { caja: 'grupo' },
    });
  }

  onRegistrarMovimiento(): void {
    const caja = this.cajaGrupo();
    if (caja) {
      this.router.navigate(['/movimientos/nuevo'], {
        queryParams: { cajaId: caja.id },
      });
    }
  }

  onTransferir(): void {
    const caja = this.cajaGrupo();
    if (!caja) return;
    const ref = this.dialog.open(TransferenciaDialogComponent, {
      data: { cajaGrupo: caja },
      autoFocus: false,
      restoreFocus: false,
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        this.state.loadCajaGrupo();
        this.state.loadMovimientosGrupo();
      }
    });
  }

  onVerMovimiento(id: string): void {
    this.router.navigate(['/movimientos', id]);
  }

  onOpenDrawer(): void {
    const caja = this.cajaGrupo();
    if (caja) {
      this.state.selectCaja(caja);
    }
  }

  onTableAction(event: ActionEvent): void {
    if (event.action === 'view') {
      this.onVerMovimiento(event.row['id'] as string);
    }
  }

  onFiltersChanged(filters: Record<string, unknown>): void {
    // TODO: Connect to state service for server-side filtering
    // For now, filters can be used for local filtering or passed to API
    console.log('Filters changed:', filters);
  }
}
