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
import { TipoEvento } from '../../../../shared/enums';
import { EventoRowComponent } from './components/evento-row.component';
import { EventoFiltersComponent } from './components/evento-filters.component';

@Component({
  selector: 'app-eventos-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    EventoRowComponent,
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

  onEdit(id: string): void {
    this.router.navigate(['/eventos', id, 'editar']);
  }

  onSelect(id: string): void {
    this.router.navigate(['/eventos', id]);
  }
}
