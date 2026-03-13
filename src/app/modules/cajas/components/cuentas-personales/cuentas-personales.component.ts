/**
 * Cuentas Personales Component
 * Smart Component - max 200 líneas
 * Gestiona las cuentas personales de educadores/protagonistas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CajasStateService } from '../../services/cajas-state.service';
import { CajaConSaldo } from '../../../../shared/models';
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import { TableColumn, TableData, ActionEvent } from '../../../../shared/models/table.model';

@Component({
  selector: 'app-cuentas-personales',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DataTableComponent,
  ],
  templateUrl: './cuentas-personales.component.html',
  styleUrls: ['./cuentas-personales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuentasPersonalesComponent implements OnInit {
  private readonly cajasState = inject(CajasStateService);
  private readonly router = inject(Router);

  readonly loading = this.cajasState.loading;

  readonly tableData = computed((): TableData[] => {
    return this.cajasState.cajasPersonales().map((caja) => ({
      id: caja.id,
      nombre: this.getNombrePropietario(caja),
      rama: this.getRamaPropietario(caja),
      saldo: caja.saldoActual,
      propietarioId: caja.propietarioId,
    }));
  });

  readonly tableColumns: TableColumn[] = [
    { key: 'nombre', header: 'Nombre', type: 'text', sortable: true },
    { key: 'rama', header: 'Rama', type: 'status', sortable: true },
    {
      key: 'saldo',
      header: 'Saldo',
      type: 'number',
      sortable: true,
      formatter: (value: unknown) =>
        `$${(value as number).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
    },
    {
      key: 'actions',
      header: 'Acciones',
      type: 'action',
      actions: [
        {
          key: 'movements',
          label: 'Movimientos',
          icon: 'receipt_long',
          tooltip: 'Ver movimientos',
        },
        { key: 'register', label: 'Registrar', icon: 'add', tooltip: 'Registrar movimiento' },
      ],
    },
  ];

  ngOnInit(): void {
    this.cajasState.loadCajasPersonales();
  }

  private getNombrePropietario(caja: CajaConSaldo): string {
    if (caja.propietario) {
      return caja.propietario.nombre;
    }
    return caja.nombre ?? '-';
  }

  private getRamaPropietario(caja: CajaConSaldo): string {
    const propietario = caja.propietario;
    if (propietario && 'rama' in propietario && propietario.rama) {
      return propietario.rama as string;
    }
    return '-';
  }

  onActionClick(event: ActionEvent): void {
    const cajaId = event.row['id'] as string;
    switch (event.action) {
      case 'movements':
        this.router.navigate(['/movimientos'], {
          queryParams: { cajaId, tipo: 'personal' },
        });
        break;
      case 'register':
        this.router.navigate(['/movimientos/nuevo'], {
          queryParams: { cajaId, tipo: 'personal' },
        });
        break;
    }
  }

  onRowClick(row: TableData): void {
    const propietarioId = row['propietarioId'] as string;
    if (propietarioId) {
      this.router.navigate(['/personas/protagonistas', propietarioId]);
    }
  }
}
