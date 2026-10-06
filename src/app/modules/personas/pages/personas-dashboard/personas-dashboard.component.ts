/**
 * Personas Dashboard Component
 * Vista unificada de gestión de personas con estadísticas, tabs y tabla filtrable
 * SIN any - tipado estricto
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PersonasStateService } from '../../services/personas-state.service';
import {
  StatCardComponent,
  StatCardVariant,
} from '../../../../shared/components/stat-card/stat-card.component';
import {
  ButtonTabsComponent,
  TabConfig,
} from '../../../../shared/components/button-tabs/button-tabs.component';
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import { GenericFiltersComponent } from '../../../../shared/components/filters/generic-filters/generic-filters.component';
import { FilterConfig } from '../../../../shared/components/filters/generic-filters/filter-config.interface';
import { FilterType } from '../../../../shared/components/filters/generic-filters/filter-type.enum';
import { TableColumn, ActionEvent, TableAction } from '../../../../shared/models/table.model';
import {
  PersonaType,
  Rama,
  EstadoPersona,
  RamaEnum,
  ESTADO_PERSONA_LABELS,
} from '../../../../shared/enums';
import { Protagonista, PersonaUnion } from '../../../../shared/models';
import {
  generateRamaTabs,
  getRamaFromTabKey,
  RAMA_TAB_KEYS,
  RamaTabKey,
} from '../../../../shared/constants/rama.constants';
import {
  PERSONA_TYPE_ICONS,
  PERSONA_TYPE_ROUTES,
} from '../../../../shared/constants/persona.constants';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import {
  esPersonaDeshabilitada,
  soloHabilitadas,
} from '../../../../shared/utils/persona-estado.util';

const FILTRO_MOSTRAR_DESHABILITADOS = 'mostrarDeshabilitados';
const ACCION_DESHABILITAR = 'deshabilitar';
const ACCION_REHABILITAR = 'rehabilitar';

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
  estado: EstadoPersona;
  estadoLabel: string;
  rama?: Rama;
  // Documentación entregada (solo protagonistas)
  partidaNacimiento?: boolean;
  dni?: boolean;
  dniPadres?: boolean;
  carnetObraSocial?: boolean;
}

/** Tab types: Rama tabs + persona type tabs */
type PersonaTabKey = 'educadores' | 'externos';
type TabKey = RamaTabKey | PersonaTabKey;

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
    ButtonComponent,
  ],
  templateUrl: './personas-dashboard.component.html',
  styleUrl: './personas-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonasDashboardComponent implements OnInit {
  private readonly state = inject(PersonasStateService);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly loading = this.state.loading;
  readonly error = this.state.error;

  /** Currently active tab */
  readonly activeTab = signal<TabKey>(RAMA_TAB_KEYS[RamaEnum.MANADA]);

  /** Current search filter */
  readonly searchFilter = signal<string>('');

  /** Los deshabilitados quedan ocultos salvo que se pida verlos */
  readonly mostrarDeshabilitados = signal<boolean>(false);

  /** Stats computed from state */
  readonly stats = computed((): readonly StatConfig[] => [
    {
      icon: PERSONA_TYPE_ICONS[PersonaType.PROTAGONISTA],
      title: 'Protagonistas',
      value: this.visibles(this.state.protagonistas()).length,
      variant: 'info',
    },
    {
      icon: PERSONA_TYPE_ICONS[PersonaType.EDUCADOR],
      title: 'Educadores',
      value: this.visibles(this.state.educadores()).length,
      variant: 'success',
    },
    {
      icon: 'people',
      title: 'Personas Extras',
      value: this.visibles(this.state.personasExternas()).length,
      variant: 'warning',
    },
    { icon: 'groups', title: 'Total Activos', value: this.totalActivos(), variant: 'danger' },
  ]);

  /** Total active personas */
  readonly totalActivos = computed((): number => {
    return this.state.allPersonas().filter((p) => p.estado === EstadoPersona.ACTIVO).length;
  });

  /** Tab configurations - generated from constants */
  readonly tabs: TabConfig[] = [
    ...generateRamaTabs(),
    { key: 'educadores', label: 'Educadores', icon: PERSONA_TYPE_ICONS[PersonaType.EDUCADOR] },
    { key: 'externos', label: 'Externos', icon: PERSONA_TYPE_ICONS[PersonaType.EXTERNA] },
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
      key: FILTRO_MOSTRAR_DESHABILITADOS,
      type: FilterType.BOOLEAN,
      label: 'Mostrar deshabilitados',
      defaultValue: false,
    },
  ];

  /** Documentación personal entregada. */
  private readonly docColumns: TableColumn[] = [
    { key: 'partidaNacimiento', header: 'Partida', type: 'boolean' },
    { key: 'dni', header: 'DNI', type: 'boolean' },
    { key: 'dniPadres', header: 'DNI Padres', type: 'boolean' },
    { key: 'carnetObraSocial', header: 'Obra Social', type: 'boolean' },
  ];

  /**
   * Table columns según la tab:
   * - Educadores: no tienen documentación personal → sin columnas de docs.
   * - Rovers: mayores de edad → se oculta solo "DNI Padres".
   * - Resto de ramas: todas las columnas de documentación.
   */
  readonly tableColumns = computed((): TableColumn[] => {
    const tab = this.activeTab();

    let docColumns: TableColumn[];
    if (tab === 'educadores') {
      docColumns = [];
    } else if (tab === RAMA_TAB_KEYS[RamaEnum.ROVERS]) {
      docColumns = this.docColumns.filter((c) => c.key !== 'dniPadres');
    } else {
      docColumns = this.docColumns;
    }

    const actions: TableColumn = {
      key: 'actions',
      header: 'Acciones',
      type: 'action',
      actions: this.getTableActions(),
    };

    const estadoColumns: TableColumn[] = this.mostrarDeshabilitados()
      ? [{ key: 'estadoLabel', header: 'Estado', type: 'status' }]
      : [];

    return [
      { key: 'nombreCompleto', header: 'Nombre y Apellido', type: 'text' },
      ...estadoColumns,
      ...docColumns,
      actions,
    ];
  });

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
    }

    personas = this.visibles(personas);

    // Apply search filter
    if (search) {
      personas = personas.filter((p) => p.nombre.toLowerCase().includes(search));
    }

    return personas.map((p) => this.mapToTableRow(p));
  });

  ngOnInit(): void {
    this.state.load();
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab as TabKey);
  }

  onFilterChange(filters: Record<string, unknown>): void {
    const search = (filters['search'] as string) ?? '';
    this.searchFilter.set(search);
    this.mostrarDeshabilitados.set(filters[FILTRO_MOSTRAR_DESHABILITADOS] === true);
  }

  onNuevoMiembro(): void {
    const tab = this.activeTab();

    if (tab === 'educadores') {
      this.router.navigate([PERSONA_TYPE_ROUTES[PersonaType.EDUCADOR], 'crear']);
    } else if (tab === 'externos') {
      this.router.navigate([PERSONA_TYPE_ROUTES[PersonaType.EXTERNA], 'crear']);
    } else {
      // For Rama tabs (manada, unidad, caminantes, rovers)
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
      case 'delete':
        this.confirmDelete(row);
        break;
      case ACCION_DESHABILITAR:
        this.confirmCambioHabilitacion(row, false);
        break;
      case ACCION_REHABILITAR:
        this.confirmCambioHabilitacion(row, true);
        break;
    }
  }

  private getTableActions(): TableAction[] {
    return [
      { key: 'view', label: 'Ver', icon: 'visibility', tooltip: 'Ver detalle' },
      { key: 'edit', label: 'Editar', icon: 'edit', tooltip: 'Editar persona' },
      {
        key: ACCION_DESHABILITAR,
        label: 'Deshabilitar',
        icon: 'person_off',
        tooltip: 'Deshabilitar (deja de aparecer al crear inscripciones, campamentos, etc.)',
        visible: (row) => !esPersonaDeshabilitada(row as PersonaTableRow),
      },
      {
        key: ACCION_REHABILITAR,
        label: 'Rehabilitar',
        icon: 'person_add',
        tooltip: 'Rehabilitar persona',
        visible: (row) => esPersonaDeshabilitada(row as PersonaTableRow),
      },
      { key: 'delete', label: 'Eliminar', icon: 'delete', tooltip: 'Eliminar persona' },
    ];
  }

  private confirmCambioHabilitacion(row: PersonaTableRow, habilitar: boolean): void {
    const titulo = habilitar ? 'Rehabilitar persona' : 'Deshabilitar persona';
    const mensaje = habilitar
      ? `${row.nombreCompleto} vuelve a aparecer en todas las listas.`
      : `${row.nombreCompleto} dejará de aparecer al crear inscripciones, campamentos, ` +
        'ventas o movimientos. Su historial y sus deudas pendientes siguen visibles.';

    this.confirmDialog
      .confirm(titulo, mensaje, {
        icon: habilitar ? 'person_add' : 'person_off',
        confirmText: habilitar ? 'Rehabilitar' : 'Deshabilitar',
      })
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.state.cambiarHabilitacion(row.id, habilitar).subscribe();
        }
      });
  }

  private confirmDelete(row: PersonaTableRow): void {
    const entityName = this.getEntityName(row.tipo);
    this.confirmDialog.confirmDelete(entityName).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.state.delete(row.id).subscribe();
      }
    });
  }

  private getEntityName(tipo: PersonaType): string {
    switch (tipo) {
      case PersonaType.PROTAGONISTA:
        return 'protagonista';
      case PersonaType.EDUCADOR:
        return 'educador';
      case PersonaType.EXTERNA:
        return 'persona externa';
      case PersonaType.AGRUPACION:
        // No se listan en el dashboard de personas, pero el switch debe ser
        // exhaustivo para que agregar un tipo nuevo rompa acá y no en runtime.
        return 'agrupacion';
    }
  }

  /** Tabla y stats comparten este criterio para que siempre coincidan. */
  private visibles<T extends PersonaUnion>(personas: T[]): T[] {
    return this.mostrarDeshabilitados() ? personas : soloHabilitadas(personas);
  }

  private getProtagonistasbyRama(rama: Rama): Protagonista[] {
    return this.state.protagonistas().filter((p) => p.rama === rama);
  }

  private mapToTableRow(persona: PersonaUnion): PersonaTableRow {
    const protagonista =
      persona.tipo === PersonaType.PROTAGONISTA ? (persona as Protagonista) : null;
    return {
      id: persona.id,
      nombreCompleto: persona.nombre,
      saldoPersonal: '$0', // TODO: Connect to actual saldo data
      deudaGrupo: '$0', // TODO: Connect to actual deuda data
      tipo: persona.tipo,
      estado: persona.estado,
      estadoLabel: ESTADO_PERSONA_LABELS[persona.estado],
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
