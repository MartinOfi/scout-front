/**
 * Educadores Table Component
 * Dumb Component - max 80 líneas
 */

import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Educador } from '../../../../../../../shared/models';
import { ESTADO_PERSONA_LABELS, CARGO_EDUCADOR_LABELS } from '../../../../../../../shared/enums';
import { DataTableComponent } from '../../../../../../../shared/components/tables/data-table.component';
import { TableColumn, TableData, ActionEvent } from '../../../../../../../shared/models/table.model';

@Component({
  selector: 'app-educadores-table',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './educadores-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EducadoresTableComponent {
  readonly data = input.required<Educador[]>();
  readonly select = output<string>();
  readonly edit = output<string>();
  readonly delete = output<string>();

  readonly tableData = computed((): TableData[] => {
    return this.data().map(e => ({
      id: e.id,
      nombre: e.nombre,
      rama: e.rama || '-',
      cargo: CARGO_EDUCADOR_LABELS[e.cargo] || e.cargo || '-',
      estado: ESTADO_PERSONA_LABELS[e.estado] || e.estado
    }));
  });

  readonly tableColumns: TableColumn[] = [
    { key: 'nombre', header: 'Nombre', type: 'text', sortable: true },
    { key: 'rama', header: 'Rama', type: 'status', sortable: true },
    { key: 'cargo', header: 'Cargo', type: 'text', sortable: true },
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
