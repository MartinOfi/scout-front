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
import { PersonasStateService } from '../../../personas/services/personas-state.service';
import { Protagonista, Educador } from '../../../../shared/models';
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
    DataTableComponent
  ],
  templateUrl: './cuentas-personales.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CuentasPersonalesComponent implements OnInit {
  private readonly cajasState = inject(CajasStateService);
  private readonly personasState = inject(PersonasStateService);
  private readonly router = inject(Router);

  readonly loading = this.cajasState.loading;

  readonly tableData = computed((): TableData[] => {
    return this.personasState.protagonistas().map(p => ({
      id: p.id,
      nombre: p.nombre,
      rama: this.getRama(p),
      saldo: 0 // TODO: Get actual balance from state
    }));
  });

  readonly tableColumns: TableColumn[] = [
    { key: 'nombre', header: 'Nombre', type: 'text', sortable: true },
    { key: 'rama', header: 'Rama', type: 'status', sortable: true },
    { key: 'saldo', header: 'Saldo', type: 'number', sortable: true,
      formatter: (value: unknown) => `$${(value as number).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` },
    {
      key: 'actions',
      header: 'Acciones',
      type: 'action',
      actions: [
        { key: 'movements', label: 'Movimientos', icon: 'receipt_long', tooltip: 'Ver movimientos' },
        { key: 'register', label: 'Registrar', icon: 'add', tooltip: 'Registrar movimiento' }
      ]
    }
  ];

  ngOnInit(): void {
    this.personasState.load();
  }

  private getRama(persona: Protagonista | Educador): string {
    if ('rama' in persona && persona.rama) {
      return persona.rama;
    }
    return '-';
  }

  onActionClick(event: ActionEvent): void {
    const id = event.row['id'] as string;
    switch (event.action) {
      case 'movements':
        this.router.navigate(['/movimientos'], {
          queryParams: { personaId: id, tipo: 'personal' }
        });
        break;
      case 'register':
        this.router.navigate(['/movimientos/nuevo'], {
          queryParams: { personaId: id, tipo: 'personal' }
        });
        break;
    }
  }

  onRowClick(row: TableData): void {
    this.router.navigate(['/personas/protagonistas', row['id']]);
  }
}
