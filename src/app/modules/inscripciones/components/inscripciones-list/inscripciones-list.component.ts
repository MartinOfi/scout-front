/**
 * Inscripciones List Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InscripcionesStateService } from '../../services/inscripciones-state.service';
import { StatCardComponent, StatCardVariant } from '../../../../shared/components/stat-card/stat-card.component';
import { ButtonTabsComponent, TabConfig } from '../../../../shared/components/button-tabs/button-tabs.component';
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import { GenericFiltersComponent } from '../../../../shared/components/filters/generic-filters/generic-filters.component';
import { FilterConfig } from '../../../../shared/components/filters/generic-filters/filter-config.interface';
import { FilterType } from '../../../../shared/components/filters/generic-filters/filter-type.enum';
import { TableColumn, ActionEvent, TableAction } from '../../../../shared/models/table.model';
import { TipoInscripcion } from '../../../../shared/enums';
import { Inscripcion } from '../../../../shared/models';

interface StatConfig {
  readonly icon: string;
  readonly title: string;
  readonly value: number;
  readonly variant: StatCardVariant;
}

interface InscripcionTableRow {
  [key: string]: unknown;
  id: string;
  persona: string;
  ano: number;
  montoTotal: string;
  montoBonificado: string;
  montoAPagar: string;
}

@Component({
  selector: 'app-inscripciones-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    StatCardComponent,
    ButtonTabsComponent,
    DataTableComponent,
    GenericFiltersComponent,
  ],
  templateUrl: './inscripciones-list.component.html',
  styleUrl: './inscripciones-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InscripcionesListComponent implements OnInit {
  readonly state: InscripcionesStateService = inject(InscripcionesStateService);
  private readonly router = inject(Router);

  readonly inscripciones = this.state.inscripciones;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  /** Currently active tab (tipo) */
  readonly activeTab = signal<TipoInscripcion>('scout_argentina');

  /** Filtered inscripciones by active tab */
  readonly filteredInscripciones = computed((): Inscripcion[] => {
    const tipo = this.activeTab();
    return this.inscripciones().filter((i) => i.tipo === tipo);
  });

  readonly stats = computed((): readonly StatConfig[] => {
    const filtered = this.filteredInscripciones();
    const total = filtered.length;
    const totalEsperado = filtered.reduce((sum, i) => sum + (i.montoTotal - i.montoBonificado), 0);
    return [
      { icon: 'people', title: 'Total Inscripciones', value: total, variant: 'info' },
      { icon: 'payments', title: 'Monto Esperado', value: totalEsperado, variant: 'success' },
    ];
  });

  /** Table data mapped from inscripciones */
  readonly tableData = computed((): InscripcionTableRow[] => {
    return this.filteredInscripciones().map((i) => ({
      id: i.id,
      persona: i.persona?.nombre ?? i.personaId,
      ano: i.ano,
      montoTotal: `$${i.montoTotal.toLocaleString()}`,
      montoBonificado: i.montoBonificado > 0 ? `$${i.montoBonificado.toLocaleString()}` : '-',
      montoAPagar: `$${(i.montoTotal - i.montoBonificado).toLocaleString()}`,
    }));
  });

  /** Tab configurations */
  readonly tabs: TabConfig[] = [
    { key: 'scout_argentina', label: 'Scout Argentina', icon: 'badge' },
    { key: 'grupo', label: 'Grupo', icon: 'groups' },
  ];

  /** Filter configurations */
  readonly filterConfigs: FilterConfig[] = [
    {
      key: 'search',
      type: FilterType.TEXT,
      label: 'Buscar',
      placeholder: 'Buscar por nombre...',
      defaultValue: '',
    },
    {
      key: 'ano',
      type: FilterType.SELECT,
      label: 'Año',
      placeholder: 'Todos los años',
      options: [
        { value: '', label: 'Todos los años' },
        { value: '2025', label: '2025' },
        { value: '2026', label: '2026' },
      ],
      defaultValue: '',
    },
  ];

  /** Table columns configuration */
  readonly tableColumns: TableColumn[] = [
    { key: 'persona', header: 'Persona', type: 'text' },
    { key: 'ano', header: 'Año', type: 'number' },
    { key: 'montoTotal', header: 'Monto Total', type: 'text' },
    { key: 'montoBonificado', header: 'Bonificado', type: 'text' },
    { key: 'montoAPagar', header: 'A Pagar', type: 'text' },
    {
      key: 'actions',
      header: 'Acciones',
      type: 'action',
      actions: this.getTableActions(),
    },
  ];

  constructor() {
    // Reload when tab changes
    effect(() => {
      const tipo = this.activeTab();
      this.state.load({ tipo });
    });
  }

  private getTableActions(): TableAction[] {
    return [
      { key: 'view', label: 'Ver', icon: 'visibility', tooltip: 'Ver detalle' },
      { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar inscripción' },
      { key: 'delete', label: 'Eliminar', icon: 'delete', tooltip: 'Eliminar inscripción' },
    ];
  }

  ngOnInit(): void {
    this.state.load({ tipo: this.activeTab() });
  }

  onTabChange(tabKey: string): void {
    this.activeTab.set(tabKey as TipoInscripcion);
  }

  onFilterChange(filters: Record<string, unknown>): void {
    console.log('Filter changed:', filters);
    // TODO: Implement actual filtering logic
  }

  onCreate(): void {
    this.router.navigate(['/inscripciones/crear']);
  }

  onEdit(id: string): void {
    this.router.navigate(['/inscripciones', id, 'editar']);
  }

  onSelect(id: string): void {
    this.router.navigate(['/inscripciones', id]);
  }

  onDelete(id: string): void {
    if (confirm('¿Está seguro de eliminar esta inscripción?')) {
      this.state.delete(id).subscribe();
    }
  }

  onActionClick(event: ActionEvent): void {
    const id = event.row['id'] as string;
    switch (event.action) {
      case 'view':
        this.onSelect(id);
        break;
      case 'edit':
        this.onEdit(id);
        break;
      case 'delete':
        this.onDelete(id);
        break;
    }
  }
}
