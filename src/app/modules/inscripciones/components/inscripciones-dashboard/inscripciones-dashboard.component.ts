/**
 * Inscripciones Dashboard Component
 * Dedicated page for comprehensive KPI dashboard
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InscripcionesStateService } from '../../services/inscripciones-state.service';
import { RamaFilter } from '../../services/inscripciones-api.service';
import { KpiDashboardComponent } from '../../../../shared/components/kpi-dashboard/kpi-dashboard.component';
import {
  ButtonTabsComponent,
  TabConfig,
} from '../../../../shared/components/button-tabs/button-tabs.component';
import { GenericFiltersComponent } from '../../../../shared/components/filters/generic-filters/generic-filters.component';
import { FilterConfig } from '../../../../shared/components/filters/generic-filters/filter-config.interface';
import { FilterType } from '../../../../shared/components/filters/generic-filters/filter-type.enum';
import { PersonaType, RamaEnum, TipoInscripcion } from '../../../../shared/enums';
import { TipoDeuda } from '../../../../shared/models';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface DashboardFilters {
  ano: string;
  tipoDeuda: TipoDeuda | '';
  rama: RamaFilter | '';
}

@Component({
  selector: 'app-inscripciones-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    KpiDashboardComponent,
    ButtonTabsComponent,
    GenericFiltersComponent,
    ButtonComponent,
  ],
  templateUrl: './inscripciones-dashboard.component.html',
  styleUrl: './inscripciones-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InscripcionesDashboardComponent implements OnInit {
  readonly state = inject(InscripcionesStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Currently active tab (tipo) */
  readonly activeTab = signal<TipoInscripcion>('scout_argentina');

  /** Current year for default filter */
  private readonly currentYear = new Date().getFullYear();

  /** Current filter values */
  readonly currentFilters = signal<DashboardFilters>({
    ano: String(this.currentYear),
    tipoDeuda: '',
    rama: '',
  });

  /** Tab configurations */
  readonly tabs: TabConfig[] = [
    { key: 'scout_argentina', label: 'Scout Argentina', icon: 'badge' },
    { key: 'grupo', label: 'Grupo', icon: 'groups' },
  ];

  /** Generate year options dynamically */
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
        { value: RamaEnum.MANADA, label: 'Manada' },
        { value: RamaEnum.UNIDAD, label: 'Unidad' },
        { value: RamaEnum.CAMINANTES, label: 'Caminantes' },
        { value: RamaEnum.ROVERS, label: 'Rovers' },
        { value: PersonaType.EDUCADOR, label: 'Educadores' },
      ],
      defaultValue: '',
    },
  ];

  constructor() {
    // Reload consolidado when tab or filters change
    effect(() => {
      const tipo = this.activeTab();
      const filters = this.currentFilters();
      const ano = filters.ano ? parseInt(filters.ano, 10) : undefined;
      const tipoDeuda = filters.tipoDeuda || undefined;
      const rama = filters.rama || undefined;

      this.state.loadConsolidado({ tipo, ano, tipoDeuda, rama });
    });
  }

  ngOnInit(): void {
    // Read query params to initialize filters
    const tipoDeudaParam = this.route.snapshot.queryParamMap.get('tipoDeuda');
    if (tipoDeudaParam && ['dinero', 'documentacion', 'ambos'].includes(tipoDeudaParam)) {
      this.currentFilters.update((f) => ({ ...f, tipoDeuda: tipoDeudaParam as TipoDeuda }));
    }

    const ramaParam = this.route.snapshot.queryParamMap.get('rama');
    if (
      ramaParam &&
      [
        RamaEnum.MANADA,
        RamaEnum.UNIDAD,
        RamaEnum.CAMINANTES,
        RamaEnum.ROVERS,
        PersonaType.EDUCADOR,
      ].includes(ramaParam as RamaFilter)
    ) {
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

  goToList(): void {
    this.router.navigate(['/inscripciones']);
  }
}
