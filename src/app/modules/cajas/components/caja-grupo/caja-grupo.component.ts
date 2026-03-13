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

import { CajasStateService } from '../../services/cajas-state.service';
import { CajaConSaldo, Movimiento } from '../../../../shared/models';

// Shared Components
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import { TableColumn, TableData, ActionEvent } from '../../../../shared/models/table.model';

// Local Components
import { SaldoCardComponent } from './components/saldo-card/saldo-card.component';

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
    SaldoCardComponent,
    ActionButtonComponent,
    DataTableComponent,
  ],
  templateUrl: './caja-grupo.component.html',
  styleUrls: ['./caja-grupo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CajaGrupoComponent implements OnInit {
  private readonly state = inject(CajasStateService);
  private readonly router = inject(Router);

  // Signals del estado
  readonly cajaGrupo = this.state.cajaGrupo;
  readonly saldoGrupo = this.state.saldoGrupo;
  readonly movimientosGrupo = this.state.movimientosGrupo;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  // Table configuration
  readonly movimientosColumns: TableColumn[] = [
    { key: 'fecha', header: 'Fecha', type: 'date', sortable: true },
    { key: 'concepto', header: 'Concepto', type: 'text', sortable: true },
    { key: 'tipo', header: 'Tipo', type: 'status' },
    { key: 'monto', header: 'Monto', type: 'number', sortable: true },
    {
      key: 'actions',
      header: 'Acciones',
      type: 'action',
      actions: [{ key: 'view', label: 'Ver', icon: 'visibility' }],
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
}
