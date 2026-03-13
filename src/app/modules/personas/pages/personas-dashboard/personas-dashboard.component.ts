/**
 * Personas Dashboard Component
 * Vista unificada de gestión de personas con estadísticas, tabs y tabla filtrable
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PersonasStateService } from '../../services/personas-state.service';
import { StatCardComponent, StatCardVariant } from '../../../../shared/components/stat-card/stat-card.component';
import { ButtonTabsComponent, TabConfig } from '../../../../shared/components/button-tabs/button-tabs.component';
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import { GenericFiltersComponent } from '../../../../shared/components/filters/generic-filters/generic-filters.component';
import { FilterConfig } from '../../../../shared/components/filters/generic-filters/filter-config.interface';
import { FilterType } from '../../../../shared/components/filters/generic-filters/filter-type.enum';
import { TableColumn, ActionEvent, TableAction } from '../../../../shared/models/table.model';
import { PersonaType, Rama, EstadoPersona } from '../../../../shared/enums';
import { Protagonista, PersonaUnion } from '../../../../shared/models';
import {
  generateRamaTabs,
  getRamaFromTabKey,
  RamaTabKey,
} from '../../../../shared/constants/rama.constants';
import {
  PERSONA_TYPE_ICONS,
  PERSONA_TYPE_ROUTES,
} from '../../../../shared/constants/persona.constants';

interface StatConfig {
  readonly icon: string;
  readonly title: string;
  readonly value: number;
  readonly variant: StatCardVariant;
}

interface PersonaTableRow {
  [key: string]: unknown;
  id: string;
  nombreCompleto: string;
  saldoPersonal: string;
  deudaGrupo: string;
  tipo: PersonaType;
  rama?: Rama;
  // Documentación entregada (solo protagonistas)
  partidaNacimiento?: boolean;
  dni?: boolean;
  dniPadres?: boolean;
  carnetObraSocial?: boolean;
}

/** Tab types: Rama tabs + persona type tabs + special tabs */
type PersonaTabKey = 'educadores' | 'externos';
type SpecialTabKey = 'deudores';
type TabKey = RamaTabKey | PersonaTabKey | SpecialTabKey;

@Component({
  selector: 'app-personas-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    StatCardComponent,
    ButtonTabsComponent,
    DataTableComponent,
    GenericFiltersComponent,
  ],
  templateUrl: './personas-dashboard.component.html',
  styleUrl: './personas-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonasDashboardComponent implements OnInit {
  private readonly state = inject(PersonasStateService);
  private readonly router = inject(Router);

  readonly loading = this.state.loading;
  readonly error = this.state.error;

  /** Currently active tab */
  readonly activeTab = signal<TabKey>('manada');

  /** Current search filter */
  readonly searchFilter = signal<string>('');

  /** Stats computed from state */
  readonly stats = computed((): readonly StatConfig[] => [
    { icon: PERSONA_TYPE_ICONS[PersonaType.PROTAGONISTA], title: 'Protagonistas', value: this.state.protagonistaCount(), variant: 'info' },
    { icon: PERSONA_TYPE_ICONS[PersonaType.EDUCADOR], title: 'Educadores', value: this.state.educadorCount(), variant: 'success' },
    { icon: 'people', title: 'Personas Extras', value: this.state.personasExternasCount(), variant: 'warning' },
    { icon: 'groups', title: 'Total Activos', value: this.totalActivos(), variant: 'danger' },
  ]);

  /** Total active personas */
  readonly totalActivos = computed((): number => {
    return this.state.allPersonas().filter(p => p.estado === EstadoPersona.ACTIVO).length;
  });

  /** Tab configurations - generated from constants */
  readonly tabs: TabConfig[] = [
    ...generateRamaTabs(),
    { key: 'educadores', label: 'Educadores', icon: PERSONA_TYPE_ICONS[PersonaType.EDUCADOR] },
    { key: 'externos', label: 'Externos', icon: PERSONA_TYPE_ICONS[PersonaType.EXTERNA] },
    { key: 'deudores', label: 'Deudores', icon: 'warning' },
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
  ];

  /** Table columns configuration */
  readonly tableColumns: TableColumn[] = [
    { key: 'nombreCompleto', header: 'Nombre y Apellido', type: 'text' },
    { key: 'partidaNacimiento', header: 'Partida', type: 'boolean' },
    { key: 'dni', header: 'DNI', type: 'boolean' },
    { key: 'dniPadres', header: 'DNI Padres', type: 'boolean' },
    { key: 'carnetObraSocial', header: 'Obra Social', type: 'boolean' },
    {
      key: 'actions',
      header: 'Acciones',
      type: 'action',
      actions: this.getTableActions(),
    },
  ];

  /** Filtered personas based on active tab and search */
  readonly filteredPersonas = computed((): PersonaTableRow[] => {
    const tab = this.activeTab();
    const search = this.searchFilter().toLowerCase();
    let personas: PersonaUnion[] = [];

    // Check if it's a Rama tab using the lookup
    const rama = getRamaFromTabKey(tab);
    if (rama) {
      personas = this.getProtagonistasbyRama(rama);
    } else if (tab === 'educadores') {
      personas = this.state.educadores();
    } else if (tab === 'externos') {
      personas = this.state.personasExternas();
    } else if (tab === 'deudores') {
      personas = this.getDeudores();
    }

    // Apply search filter
    if (search) {
      personas = personas.filter(p =>
        p.nombre.toLowerCase().includes(search)
      );
    }

    return personas.map(p => this.mapToTableRow(p));
  });

  ngOnInit(): void {
    this.state.load();
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab as TabKey);
  }

  onFilterChange(filters: Record<string, unknown>): void {
    const search = filters['search'] as string ?? '';
    this.searchFilter.set(search);
  }

  onNuevoMiembro(): void {
    const tab = this.activeTab();

    if (tab === 'educadores') {
      this.router.navigate([PERSONA_TYPE_ROUTES[PersonaType.EDUCADOR], 'crear']);
    } else if (tab === 'externos') {
      this.router.navigate([PERSONA_TYPE_ROUTES[PersonaType.EXTERNA], 'crear']);
    } else {
      // For Rama tabs (manada, unidad, caminantes, rovers) and deudores
      this.router.navigate([PERSONA_TYPE_ROUTES[PersonaType.PROTAGONISTA], 'crear']);
    }
  }

  onActionClick(event: ActionEvent): void {
    const row = event.row as PersonaTableRow;
    const tipo = row.tipo;

    switch (event.action) {
      case 'view':
        this.navigateToDetail(row.id, tipo);
        break;
      case 'edit':
        this.navigateToEdit(row.id, tipo);
        break;
    }
  }

  private getTableActions(): TableAction[] {
    return [
      { key: 'view', label: 'Ver', icon: 'visibility', tooltip: 'Ver detalle' },
      { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar persona' },
    ];
  }

  private getProtagonistasbyRama(rama: Rama): Protagonista[] {
    return this.state.protagonistas().filter(p => p.rama === rama);
  }

  private getDeudores(): PersonaUnion[] {
    // TODO: Implement actual deudores logic when saldo is available
    return [];
  }

  private mapToTableRow(persona: PersonaUnion): PersonaTableRow {
    const protagonista = persona.tipo === PersonaType.PROTAGONISTA ? persona as Protagonista : null;
    return {
      id: persona.id,
      nombreCompleto: persona.nombre,
      saldoPersonal: '$0', // TODO: Connect to actual saldo data
      deudaGrupo: '$0', // TODO: Connect to actual deuda data
      tipo: persona.tipo,
      rama: protagonista?.rama,
      // Documentación entregada (solo para protagonistas)
      partidaNacimiento: protagonista?.partidaNacimiento ?? false,
      dni: protagonista?.dni ?? false,
      dniPadres: protagonista?.dniPadres ?? false,
      carnetObraSocial: protagonista?.carnetObraSocial ?? false,
    };
  }

  private navigateToDetail(id: string, tipo: PersonaType): void {
    this.router.navigate([PERSONA_TYPE_ROUTES[tipo], id]);
  }

  private navigateToEdit(id: string, tipo: PersonaType): void {
    this.router.navigate([PERSONA_TYPE_ROUTES[tipo], id, 'editar']);
  }
}
