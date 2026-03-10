/**
 * Cuotas List Component
 * Smart Component - max 200 lineas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CuotasStateService } from '../../../cuotas/services/cuotas-state.service';
import { ESTADO_CUOTA_LABELS } from '../../../../shared/enums';
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import { TableColumn, TableData, ActionEvent } from '../../../../shared/models/table.model';

@Component({
  selector: 'app-cuotas-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DataTableComponent
  ],
  templateUrl: './cuotas-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CuotasListComponent implements OnInit {
  readonly state: CuotasStateService = inject(CuotasStateService);
  private readonly router = inject(Router);

  readonly cuotas = this.state.cuotas;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  readonly tableData = computed((): TableData[] => {
    return this.cuotas().map(c => ({
      id: c.id,
      persona: c.persona?.nombre || '',
      nombre: c.nombre,
      ano: c.ano,
      monto: c.montoTotal,
      estado: ESTADO_CUOTA_LABELS[c.estado] || c.estado
    }));
  });

  readonly tableColumns: TableColumn[] = [
    { key: 'persona', header: 'Persona', type: 'text', sortable: true },
    { key: 'nombre', header: 'Cuota', type: 'text', sortable: true },
    { key: 'ano', header: 'Año', type: 'number', sortable: true },
    { key: 'monto', header: 'Monto', type: 'number', sortable: true,
      formatter: (value: unknown) => `$${(value as number).toLocaleString('es-AR')}` },
    { key: 'estado', header: 'Estado', type: 'status', sortable: true },
    {
      key: 'actions',
      header: 'Acciones',
      type: 'action',
      actions: [
        { key: 'payment', label: 'Pagar', icon: 'payment', tooltip: 'Registrar pago' }
      ]
    }
  ];

  ngOnInit(): void {
    this.state.load();
  }

  onActionClick(event: ActionEvent): void {
    const id = event.row['id'] as string;
    if (event.action === 'payment') {
      // TODO: Open payment dialog
      console.log('Register payment for cuota:', id);
    }
  }

  onBack(): void {
    this.router.navigate(['/inscripciones']);
  }
}
