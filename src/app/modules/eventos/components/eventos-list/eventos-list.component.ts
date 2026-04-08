/**
 * Eventos List Component
 * Smart Component - card grid aesthetic mirroring campamentos-list
 * SIN any - tipado estricto
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { EventosStateService } from '../../services/eventos-state.service';
import { Evento } from '../../../../shared/models';
import { TipoEvento, TIPO_EVENTO_LABELS } from '../../../../shared/enums';
import { ButtonComponent, LoadingSpinnerComponent } from '../../../../shared';
import { EventoCardComponent } from './components/evento-card/evento-card.component';
import { GenericFiltersComponent } from '../../../../shared/components/filters/generic-filters/generic-filters.component';
import { FilterConfig } from '../../../../shared/components/filters/generic-filters/filter-config.interface';
import { FilterType } from '../../../../shared/components/filters/generic-filters/filter-type.enum';

interface EventoStats {
  total: number;
  venta: number;
  grupo: number;
}

@Component({
  selector: 'app-eventos-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    GenericFiltersComponent,
    EventoCardComponent,
    ButtonComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './eventos-list.component.html',
  styleUrl: './eventos-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventosListComponent implements OnInit {
  readonly state: EventosStateService = inject(EventosStateService);
  private readonly router = inject(Router);

  readonly eventos = this.state.eventos;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  readonly filtroTipo = signal<TipoEvento | 'todos'>('todos');
  readonly filtroBusqueda = signal<string>('');

  readonly filterConfigs: FilterConfig[] = [
    {
      key: 'busqueda',
      type: FilterType.SEARCH,
      label: 'Buscar',
      placeholder: 'Nombre del evento',
    },
    {
      key: 'tipo',
      type: FilterType.SELECT,
      label: 'Tipo',
      placeholder: 'Todos',
      defaultValue: 'todos',
      options: [
        { value: 'todos', label: 'Todos' },
        ...Object.entries(TIPO_EVENTO_LABELS).map(([value, label]) => ({ value, label })),
      ],
    },
  ];

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

  /** Stats computed from all (unfiltered) events for summary bar */
  readonly stats = computed((): EventoStats => {
    const all = this.eventos();
    let venta = 0;
    let grupo = 0;
    for (const e of all) {
      if (e.tipo === TipoEvento.VENTA) venta++;
      else grupo++;
    }
    return { total: all.length, venta, grupo };
  });

  ngOnInit(): void {
    this.state.load();
  }

  onFiltroChange(filtros: Record<string, unknown>): void {
    this.filtroTipo.set((filtros['tipo'] as TipoEvento | 'todos') ?? 'todos');
    this.filtroBusqueda.set((filtros['busqueda'] as string) ?? '');
  }

  onCreate(): void {
    this.router.navigate(['/eventos/crear']);
  }

  onSelect(id: string): void {
    this.router.navigate(['/eventos', id]);
  }

  onEdit(id: string): void {
    this.router.navigate(['/eventos', id, 'editar']);
  }
}
