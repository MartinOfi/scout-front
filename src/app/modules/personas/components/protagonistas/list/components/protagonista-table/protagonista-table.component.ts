/**
 * Protagonista Table Component
 * Dumb Component - max 100 líneas
 * Solo presentación, sin lógica de negocio
 */

import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Protagonista } from '../../../../../../../shared/models';
import { ESTADO_PERSONA_LABELS } from '../../../../../../../shared/enums';
import { DataTableComponent } from '../../../../../../../shared/components/tables/data-table.component';
import { TableColumn, TableData, ActionEvent } from '../../../../../../../shared/models/table.model';

@Component({
  selector: 'app-protagonista-table',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './protagonista-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtagonistaTableComponent {
  readonly data = input.required<Protagonista[]>();
  readonly select = output<string>();
  readonly edit = output<string>();
  readonly delete = output<string>();

  readonly tableData = computed((): TableData[] => {
    return this.data().map(p => ({
      id: p.id,
      nombre: p.nombre,
      rama: p.rama,
      estado: ESTADO_PERSONA_LABELS[p.estado] || p.estado
    }));
  });

  readonly tableColumns: TableColumn[] = [
    { key: 'nombre', header: 'Nombre', type: 'text', sortable: true },
    { key: 'rama', header: 'Rama', type: 'status', sortable: true },
    { key: 'estado', header: 'Estado', type: 'status', sortable: true },
    {
      key: 'actions',
      header: 'Acciones',
      type: 'action',
      actions: [
        { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar' },
        { key: 'delete', label: 'Eliminar', icon: 'delete', className: 'text-red-600', tooltip: 'Eliminar' }
      ]
    }
  ];

  onActionClick(event: ActionEvent): void {
    const id = event.row['id'] as string;
    switch (event.action) {
      case 'edit':
        this.edit.emit(id);
        break;
      case 'delete':
        this.delete.emit(id);
        break;
    }
  }

  onRowClick(row: TableData): void {
    this.select.emit(row['id'] as string);
  }
}
