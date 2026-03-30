/**
 * Inscripciones List Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InscripcionesStateService } from '../../services/inscripciones-state.service';
import { RamaFilter } from '../../services/inscripciones-api.service';
import {
  ButtonTabsComponent,
  TabConfig,
} from '../../../../shared/components/button-tabs/button-tabs.component';
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import { GenericFiltersComponent } from '../../../../shared/components/filters/generic-filters/generic-filters.component';
import { FilterConfig } from '../../../../shared/components/filters/generic-filters/filter-config.interface';
import { FilterType } from '../../../../shared/components/filters/generic-filters/filter-type.enum';
import { TableColumn, ActionEvent, TableAction } from '../../../../shared/models/table.model';
import { TipoInscripcion, RamaEnum, PersonaType, RAMA_LABELS } from '../../../../shared/enums';
import { Inscripcion, TipoDeuda } from '../../../../shared/models';
import { ConfirmDialogService } from '../../../../shared/services';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface InscripcionFilters {
  search: string;
  ano: string;
  tipoDeuda: TipoDeuda | '';
  rama: RamaFilter | '';
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
  certificadoAptitudFisica: boolean;
}

@Component({
  selector: 'app-inscripciones-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ButtonTabsComponent,
    DataTableComponent,
    GenericFiltersComponent,
    ButtonComponent,
  ],
  templateUrl: './inscripciones-list.component.html',
  styleUrl: './inscripciones-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InscripcionesListComponent implements OnInit {
  readonly state: InscripcionesStateService = inject(InscripcionesStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly inscripciones = this.state.inscripciones;
  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly consolidado = this.state.consolidado;

  /** Rama configurations for simplified stats */
  readonly ramaConfigs = [
    { key: 'manada' as const, label: 'Manada', color: '#f59e0b' },
    { key: 'unidad' as const, label: 'Unidad', color: '#10b981' },
    { key: 'caminantes' as const, label: 'Caminantes', color: '#3b82f6' },
    { key: 'rovers' as const, label: 'Rovers', color: '#8b5cf6' },
    { key: 'educadores' as const, label: 'Educadores', color: '#812128' },
  ];

  /** Simplified rama distribution for stats bar */
  readonly ramaDistribution = computed(() => {
    const data = this.consolidado();
    if (!data) return [];

    const total = data.total || 1;
    return this.ramaConfigs.map((rama) => {
      const count = data.porRama[rama.key];
      const percentage = (count / total) * 100;
      return {
        ...rama,
        count,
        percentage,
      };
    });
  });

  /** Currently active tab (tipo) */
  readonly activeTab = signal<TipoInscripcion>('scout_argentina');

  /** Current year for default filter */
  private readonly currentYear = new Date().getFullYear();

  /** Current filter values - defaults to current year */
  readonly currentFilters = signal<InscripcionFilters>({
    search: '',
    ano: String(this.currentYear),
    tipoDeuda: '',
    rama: '',
  });

  /** Filtered inscripciones by search (other filters handled by backend) */
  readonly filteredInscripciones = computed((): Inscripcion[] => {
    const filters = this.currentFilters();

    // Backend handles tipo, ano, tipoDeuda filtering
    // Local filtering only for search (name matching)
    if (!filters.search) {
      return this.inscripciones();
    }

    const searchLower = filters.search.toLowerCase();
    return this.inscripciones().filter((inscripcion) => {
      const personaName = inscripcion.persona?.nombre?.toLowerCase() || '';
      return personaName.includes(searchLower);
    });
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
      certificadoAptitudFisica: i.certificadoAptitudFisica,
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
      defaultValue: String(this.currentYear),
    },
    {
      key: 'tipoDeuda',
      type: FilterType.SELECT,
      label: 'Tipo de Deuda',
      placeholder: 'Todos',
      options: [
        { value: '', label: 'Todos' },
        { value: 'dinero', label: 'Deuda de dinero' },
        { value: 'documentacion', label: 'Documentación faltante' },
        { value: 'ambos', label: 'Dinero y documentación' },
      ],
      defaultValue: '',
    },
    {
      key: 'rama',
      type: FilterType.SELECT,
      label: 'Rama',
      placeholder: 'Todas las ramas',
      options: [
        { value: '', label: 'Todas las ramas' },
        { value: RamaEnum.MANADA, label: RAMA_LABELS[RamaEnum.MANADA] },
        { value: RamaEnum.UNIDAD, label: RAMA_LABELS[RamaEnum.UNIDAD] },
        { value: RamaEnum.CAMINANTES, label: RAMA_LABELS[RamaEnum.CAMINANTES] },
        { value: RamaEnum.ROVERS, label: RAMA_LABELS[RamaEnum.ROVERS] },
        { value: PersonaType.EDUCADOR, label: 'Educadores' },
      ],
      defaultValue: '',
    },
  ];

  /** Base columns shared by all inscription types */
  private readonly baseColumns: TableColumn[] = [
    { key: 'persona', header: 'Persona', type: 'text' },
    { key: 'montoPagado', header: 'Pagado', type: 'text' },
    { key: 'saldoPendiente', header: 'Pendiente', type: 'text' },
    { key: 'estado', header: 'Estado', type: 'status' },
  ];

  /** Document columns only for Scout Argentina */
  private readonly documentColumns: TableColumn[] = [
    { key: 'declaracionDeSalud', header: 'Declaración de Salud', type: 'boolean' },
    { key: 'autorizacionDeImagen', header: 'Autorización de Imagen', type: 'boolean' },
    { key: 'salidasCercanas', header: 'Salidas Cercanas', type: 'boolean' },
    { key: 'autorizacionIngreso', header: 'Autorización de Ingreso', type: 'boolean' },
    { key: 'certificadoAptitudFisica', header: 'Cert. Aptitud Física', type: 'boolean' },
  ];

  /** Action column */
  private readonly actionColumn: TableColumn = {
    key: 'actions',
    header: 'Acciones',
    type: 'action',
    actions: this.getTableActions(),
  };

  /** Dynamic table columns based on active tab */
  readonly tableColumns = computed((): TableColumn[] => {
    const isScoutArgentina = this.activeTab() === 'scout_argentina';
    return isScoutArgentina
      ? [...this.baseColumns, ...this.documentColumns, this.actionColumn]
      : [...this.baseColumns, this.actionColumn];
  });

  constructor() {
    // Reload inscripciones and consolidado when tab or filters change
    effect(() => {
      const tipo = this.activeTab();
      const filters = this.currentFilters();
      const ano = filters.ano ? parseInt(filters.ano, 10) : undefined;
      const tipoDeuda = filters.tipoDeuda || undefined;
      const rama = filters.rama || undefined;

      // Load both inscripciones list and consolidado stats
      this.state.load({ tipo, ano, tipoDeuda, rama });
      this.state.loadConsolidado({ tipo, ano, tipoDeuda, rama });
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
    // Read query params to initialize filters
    const tipoDeudaParam = this.route.snapshot.queryParamMap.get('tipoDeuda');
    if (tipoDeudaParam && ['dinero', 'documentacion', 'ambos'].includes(tipoDeudaParam)) {
      this.currentFilters.update((f) => ({ ...f, tipoDeuda: tipoDeudaParam as TipoDeuda }));
    }

    const ramaParam = this.route.snapshot.queryParamMap.get('rama');
    const validRamaValues = [...Object.values(RamaEnum), PersonaType.EDUCADOR];
    if (ramaParam && validRamaValues.includes(ramaParam as RamaFilter)) {
      this.currentFilters.update((f) => ({ ...f, rama: ramaParam as RamaFilter }));
    }
  }

  onTabChange(tabKey: string): void {
    this.activeTab.set(tabKey as TipoInscripcion);
  }

  onFilterChange(filters: Record<string, unknown>): void {
    const tipoDeuda = (filters['tipoDeuda'] as TipoDeuda | '') ?? '';
    const rama = (filters['rama'] as RamaFilter | '') ?? '';
    this.currentFilters.set({
      search: (filters['search'] as string) ?? '',
      ano: (filters['ano'] as string) ?? '',
      tipoDeuda,
      rama,
    });
    // Update URL with filter query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        tipoDeuda: tipoDeuda || null,
        rama: rama || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  onCreate(): void {
    this.router.navigate(['/inscripciones/crear']);
  }

  goToDashboard(): void {
    const filters = this.currentFilters();
    this.router.navigate(['/inscripciones/dashboard'], {
      queryParams: {
        tipoDeuda: filters.tipoDeuda || null,
        rama: filters.rama || null,
      },
    });
  }

  onEdit(id: string): void {
    this.router.navigate(['/inscripciones', id, 'editar']);
  }

  onSelect(id: string): void {
    this.router.navigate(['/inscripciones', id]);
  }

  onDelete(id: string): void {
    this.confirmDialog
      .delete('inscripción', () => this.state.deleteAsync(id))
      .subscribe((result) => {
        if (result.deleted) {
          // Reload the list and consolidado after successful deletion
          const tipo = this.activeTab();
          const filters = this.currentFilters();
          const ano = filters.ano ? parseInt(filters.ano, 10) : undefined;
          const tipoDeuda = filters.tipoDeuda || undefined;
          const rama = filters.rama || undefined;
          this.state.load({ tipo, ano, tipoDeuda, rama });
          this.state.loadConsolidado({ tipo, ano, tipoDeuda, rama });
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
