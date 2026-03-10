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
import { ConfirmDialogService } from '../../../../shared/services';

interface StatConfig {
  readonly icon: string;
  readonly title: string;
  readonly value: number;
  readonly variant: StatCardVariant;
}

interface InscripcionFilters {
  search: string;
  ano: string;
}

interface InscripcionTableRow {
  [key: string]: unknown;
  id: string;
  persona: string;
  ano: number;
  montoTotal: string;
  montoBonificado: string;
  montoPagado: string;
  saldoPendiente: string;
  estado: string;
  declaracionDeSalud: boolean;
  autorizacionDeImagen: boolean;
  salidasCercanas: boolean;
  autorizacionIngreso: boolean;
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
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly inscripciones = this.state.inscripciones;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  /** Currently active tab (tipo) */
  readonly activeTab = signal<TipoInscripcion>('scout_argentina');

  /** Current filter values */
  readonly currentFilters = signal<InscripcionFilters>({ search: '', ano: '' });

  /** Filtered inscripciones by active tab and filters */
  readonly filteredInscripciones = computed((): Inscripcion[] => {
    const tipo = this.activeTab();
    const filters = this.currentFilters();

    return this.inscripciones().filter((inscripcion) => {
      // Filter by tipo (tab)
      if (inscripcion.tipo !== tipo) return false;

      // Filter by year
      if (filters.ano && inscripcion.ano !== parseInt(filters.ano, 10)) return false;

      // Filter by search (persona name)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const personaName = inscripcion.persona?.nombre?.toLowerCase() || '';
        if (!personaName.includes(searchLower)) return false;
      }

      return true;
    });
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
      montoPagado: `$${(i.montoPagado ?? 0).toLocaleString()}`,
      saldoPendiente: `$${(i.saldoPendiente ?? 0).toLocaleString()}`,
      estado: i.estado ?? 'pendiente',
      declaracionDeSalud: i.declaracionDeSalud,
      autorizacionDeImagen: i.autorizacionDeImagen,
      salidasCercanas: i.salidasCercanas,
      autorizacionIngreso: i.autorizacionIngreso,
    }));
  });

  /** Tab configurations */
  readonly tabs: TabConfig[] = [
    { key: 'scout_argentina', label: 'Scout Argentina', icon: 'badge' },
    { key: 'grupo', label: 'Grupo', icon: 'groups' },
  ];

  /** Generate year options dynamically (current year ± 1) */
  private getYearOptions(): { value: string; label: string }[] {
    const currentYear = new Date().getFullYear();
    return [
      { value: '', label: 'Todos los años' },
      { value: String(currentYear - 1), label: String(currentYear - 1) },
      { value: String(currentYear), label: String(currentYear) },
      { value: String(currentYear + 1), label: String(currentYear + 1) },
    ];
  }

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
      options: this.getYearOptions(),
      defaultValue: '',
    },
  ];

  /** Table columns configuration */
  readonly tableColumns: TableColumn[] = [
    { key: 'persona', header: 'Persona', type: 'text' },
    { key: 'montoPagado', header: 'Pagado', type: 'text' },
    { key: 'saldoPendiente', header: 'Pendiente', type: 'text' },
    { key: 'estado', header: 'Estado', type: 'status' },
    { key: "declaracionDeSalud", header: "Declaración de Salud", type: "boolean" },
    { key: "autorizacionDeImagen", header: "Autorización de Imagen", type: "boolean" },
    { key: "salidasCercanas", header: "Salidas Cercanas", type: "boolean" },
    { key: "autorizacionIngreso", header: "Autorización de Ingreso", type: "boolean" },
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
    this.currentFilters.set({
      search: (filters['search'] as string) ?? '',
      ano: (filters['ano'] as string) ?? '',
    });
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
    this.confirmDialog.confirmDelete('inscripción').subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.state.delete(id).subscribe();
      }
    });
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
