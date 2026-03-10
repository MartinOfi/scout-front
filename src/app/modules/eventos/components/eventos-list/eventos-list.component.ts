/**
 * Eventos List Component
 * Smart Component - max 200 lineas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EventosStateService } from '../../services/eventos-state.service';
import { Evento } from '../../../../shared/models';
import { TipoEvento, TIPO_EVENTO_LABELS } from '../../../../shared/enums';
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import { TableColumn, TableData, ActionEvent } from '../../../../shared/models/table.model';
import { EventoFiltersComponent } from './components/evento-filters.component';

@Component({
  selector: 'app-eventos-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DataTableComponent,
    EventoFiltersComponent
  ],
  templateUrl: './eventos-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventosListComponent implements OnInit {
  readonly state: EventosStateService = inject(EventosStateService);
  private readonly router = inject(Router);

  readonly eventos = this.state.eventos;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  readonly filtroTipo = signal<TipoEvento | 'todos'>('todos');
  readonly filtroBusqueda = signal<string>('');

  readonly eventosFiltrados = computed((): Evento[] => {
    let lista: Evento[] = this.eventos();
    const tipo: TipoEvento | 'todos' = this.filtroTipo();
    const busqueda: string = this.filtroBusqueda().toLowerCase();

    if (tipo !== 'todos') {
      lista = lista.filter((e: Evento) => e.tipo === tipo);
    }
    if (busqueda) {
      lista = lista.filter((e: Evento) => e.nombre.toLowerCase().includes(busqueda));
    }
    return lista;
  });

  readonly tableData = computed((): TableData[] => {
    return this.eventosFiltrados().map(e => ({
      id: e.id,
      nombre: e.nombre,
      fecha: e.fecha,
      tipo: TIPO_EVENTO_LABELS[e.tipo] || e.tipo,
      descripcion: e.descripcion || ''
    }));
  });

  readonly tableColumns: TableColumn[] = [
    { key: 'nombre', header: 'Nombre', type: 'text', sortable: true },
    { key: 'fecha', header: 'Fecha', type: 'date', sortable: true },
    { key: 'tipo', header: 'Tipo', type: 'status', sortable: true },
    { key: 'descripcion', header: 'Descripción', type: 'text' },
    {
      key: 'actions',
      header: 'Acciones',
      type: 'action',
      actions: [
        { key: 'view', label: 'Ver', icon: 'visibility', tooltip: 'Ver detalle' },
        { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar' }
      ]
    }
  ];

  ngOnInit(): void {
    this.state.load();
  }

  onFiltroChange(filtros: { tipo: TipoEvento | 'todos'; busqueda: string }): void {
    this.filtroTipo.set(filtros.tipo);
    this.filtroBusqueda.set(filtros.busqueda);
  }

  onCreate(): void {
    this.router.navigate(['/eventos/crear']);
  }

  onActionClick(event: ActionEvent): void {
    const id = event.row['id'] as string;
    switch (event.action) {
      case 'view':
        this.router.navigate(['/eventos', id]);
        break;
      case 'edit':
        this.router.navigate(['/eventos', id, 'editar']);
        break;
    }
  }

  onRowClick(row: TableData): void {
    this.router.navigate(['/eventos', row['id']]);
  }
}
