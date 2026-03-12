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
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InscripcionesStateService } from '../../services/inscripciones-state.service';
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
  soloDeudores: boolean;
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
  private readonly route = inject(ActivatedRoute);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly inscripciones = this.state.inscripciones;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  /** Currently active tab (tipo) */
  readonly activeTab = signal<TipoInscripcion>('scout_argentina');

  /** Current year for default filter */
  private readonly currentYear = new Date().getFullYear();

  /** Current filter values - defaults to current year */
  readonly currentFilters = signal<InscripcionFilters>({
    search: '',
    ano: String(this.currentYear),
    soloDeudores: false,
  });

  /**
   * Check if an inscripcion is considered a "debtor"
   * A debtor has pending payment OR (for Scout Argentina only) is missing any of the 4 required documents
   */
  private isDeudor(inscripcion: Inscripcion): boolean {
    const hasPendingPayment = (inscripcion.saldoPendiente ?? 0) > 0;

    // Only check documents for Scout Argentina inscriptions
    if (inscripcion.tipo === 'scout_argentina') {
      const missingDocuments =
        !inscripcion.declaracionDeSalud ||
        !inscripcion.autorizacionDeImagen ||
        !inscripcion.salidasCercanas ||
        !inscripcion.autorizacionIngreso;
      return hasPendingPayment || missingDocuments;
    }

    return hasPendingPayment;
  }

  /** Filtered inscripciones by active tab and filters */
  readonly filteredInscripciones = computed((): Inscripcion[] => {
    const tipo = this.activeTab();
    const filters = this.currentFilters();

    return this.inscripciones().filter((inscripcion) => {
      // Filter by tipo (tab)
      if (inscripcion.tipo !== tipo) return false;

      // Filter by year (now handled by backend, but keep for local consistency)
      if (filters.ano && inscripcion.ano !== parseInt(filters.ano, 10)) return false;

      // Filter by search (persona name)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const personaName = inscripcion.persona?.nombre?.toLowerCase() || '';
        if (!personaName.includes(searchLower)) return false;
      }

      // Filter by deudores (pending payment OR missing documents)
      if (filters.soloDeudores && !this.isDeudor(inscripcion)) return false;

      return true;
    });
  });

  readonly stats = computed((): readonly StatConfig[] => {
    const filtered = this.filteredInscripciones();
    const total = filtered.length;
    const totalEsperado = filtered.reduce((sum, i) => sum + (i.montoTotal - i.montoBonificado), 0);
    const montoAdeudado = filtered.reduce((sum, i) => sum + (i.saldoPendiente ?? 0), 0);
    const cantidadDeudores = filtered.filter((i) => this.isDeudor(i)).length;

    return [
      { icon: 'people', title: 'Total Inscripciones', value: total, variant: 'info' },
      { icon: 'payments', title: 'Monto Esperado', value: totalEsperado, variant: 'success' },
      { icon: 'warning', title: 'Monto Adeudado', value: montoAdeudado, variant: 'warning' },
      {
        icon: 'person_off',
        title: 'Cantidad Deudores',
        value: cantidadDeudores,
        variant: 'danger',
      },
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
      defaultValue: String(this.currentYear),
    },
    {
      key: 'soloDeudores',
      type: FilterType.BOOLEAN,
      label: 'Solo deudores',
      defaultValue: false,
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
    // Reload when tab or year filter changes
    effect(() => {
      const tipo = this.activeTab();
      const filters = this.currentFilters();
      const ano = filters.ano ? parseInt(filters.ano, 10) : undefined;
      this.state.load({ tipo, ano });
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
    // Read deudores query param to initialize filter
    const deudoresParam = this.route.snapshot.queryParamMap.get('deudores');
    if (deudoresParam === 'true') {
      this.currentFilters.update((f) => ({ ...f, soloDeudores: true }));
    }
  }

  onTabChange(tabKey: string): void {
    this.activeTab.set(tabKey as TipoInscripcion);
  }

  onFilterChange(filters: Record<string, unknown>): void {
    const soloDeudores = (filters['soloDeudores'] as boolean) ?? false;
    this.currentFilters.set({
      search: (filters['search'] as string) ?? '',
      ano: (filters['ano'] as string) ?? '',
      soloDeudores,
    });
    // Update URL with deudores query param
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { deudores: soloDeudores || null },
      queryParamsHandling: 'merge',
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
