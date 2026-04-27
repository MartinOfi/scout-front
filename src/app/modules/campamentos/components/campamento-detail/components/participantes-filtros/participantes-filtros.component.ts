/**
 * Participantes Filtros Component
 * Dumb Component - filtros de participantes por nombre y rama
 * SIN any - tipado estricto
 */

import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { GenericFiltersComponent } from '../../../../../../shared/components/filters/generic-filters/generic-filters.component';
import { FilterConfig } from '../../../../../../shared/components/filters/generic-filters/filter-config.interface';
import { FilterType } from '../../../../../../shared/components/filters/generic-filters/filter-type.enum';
import { FilterValueMap } from '../../../../../../shared/components/filters/generic-filters/filter-value.type';

@Component({
  selector: 'app-participantes-filtros',
  standalone: true,
  imports: [GenericFiltersComponent],
  template: `
    <app-generic-filters
      [filterConfigs]="filterConfigs"
      [autoApply]="true"
      (filtersChanged)="filtersChanged.emit($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantesFiltrosComponent {
  readonly filtersChanged = output<FilterValueMap>();

  readonly filterConfigs: readonly FilterConfig[] = [
    {
      key: 'nombre',
      type: FilterType.TEXT,
      label: 'Nombre',
      placeholder: 'Buscar por nombre...',
    },
    {
      key: 'rama',
      type: FilterType.SELECT,
      label: 'Rama',
      options: [
        { value: 'educador', label: 'Educadores' },
        { value: 'Manada', label: 'Manada' },
        { value: 'Unidad', label: 'Unidad' },
        { value: 'Caminantes', label: 'Caminantes' },
        { value: 'Rovers', label: 'Rovers' },
      ],
    },
  ];
}
