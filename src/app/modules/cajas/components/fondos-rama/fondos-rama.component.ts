/**
 * Fondos Rama Component
 * Smart Component - max 200 lines
 * Displays 5 KPI cards + unified movements table with backend filtering
 * NO any - strict typing with enums
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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CajasStateService } from '../../services/cajas-state.service';
import { MovimientosApiService } from '../../../movimientos/services/movimientos-api.service';
import { Movimiento, MovimientosFilters, PaginationParams } from '../../../../shared/models';
import {
  CajaType,
  CAJA_TYPE_LABELS,
  TipoMovimientoEnum,
  ConceptoMovimiento,
  CONCEPTO_MOVIMIENTO_LABELS,
  RamaEnum,
} from '../../../../shared/enums';

// Shared Components
import {
  StatCardComponent,
  StatCardVariant,
} from '../../../../shared/components/stat-card/stat-card.component';
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import { GenericFiltersComponent } from '../../../../shared/components/filters/generic-filters/generic-filters.component';
import { ChipsFilterComponent } from '../../../../shared/components/filters/chips-filter/chips-filter.component';
import { ChipConfig } from '../../../../shared/components/filters/chips-filter/chip-config.interface';
import { TableColumn, ActionEvent, TableData } from '../../../../shared/models/table.model';
import { FilterConfig } from '../../../../shared/components/filters/generic-filters/filter-config.interface';
import { FilterType } from '../../../../shared/components/filters/generic-filters/filter-type.enum';
import {
  CAJA_ICONS,
  CAJA_RAMA_VARIANTS,
  CAJA_RAMA_CHIP_COLORS,
  getCajaRamaVariant,
} from '../../../../shared/config/rama.config';

/** Rama caja types for filtering */
const RAMA_CAJA_TYPES = [
  CajaType.RAMA_MANADA,
  CajaType.RAMA_UNIDAD,
  CajaType.RAMA_CAMINANTES,
  CajaType.RAMA_ROVERS,
] as const;

@Component({
  selector: 'app-fondos-rama',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    StatCardComponent,
    DataTableComponent,
    GenericFiltersComponent,
    ChipsFilterComponent,
  ],
  templateUrl: './fondos-rama.component.html',
  styleUrls: ['./fondos-rama.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FondosRamaComponent implements OnInit {
  private readonly state = inject(CajasStateService);
  private readonly movimientosApi = inject(MovimientosApiService);
  private readonly router = inject(Router);

  // State signals
  readonly cajasRama = this.state.cajasRama;
  readonly saldoManada = this.state.saldoManada;
  readonly saldoUnidad = this.state.saldoUnidad;
  readonly saldoCaminantes = this.state.saldoCaminantes;
  readonly saldoRovers = this.state.saldoRovers;
  readonly totalSaldosRamas = this.state.totalSaldosRamas;
  readonly loading = this.state.loading;

  // Movimientos state
  readonly movimientos = signal<Movimiento[]>([]);
  readonly movimientosTableData = computed(() => this.movimientos() as unknown as TableData[]);
  readonly movimientosLoading = signal(false);

  // Rama chips selection state (null = Todas)
  readonly selectedRamas = signal<Array<string | number | null>>([null]);

  // Enum references for template
  readonly CajaType = CajaType;
  readonly CAJA_TYPE_LABELS = CAJA_TYPE_LABELS;
  readonly CAJA_ICONS = CAJA_ICONS;
  readonly CAJA_RAMA_VARIANTS = CAJA_RAMA_VARIANTS;
  readonly RAMA_CAJA_TYPES = RAMA_CAJA_TYPES;

  // Rama chips configuration with colors
  readonly ramaChips: ChipConfig[] = [
    {
      value: null,
      label: 'Todas',
      icon: 'select_all',
      backgroundColor: '#6b7280',
      textColor: '#ffffff',
    },
    ...RAMA_CAJA_TYPES.map((cajaType) => ({
      value: cajaType,
      label: CAJA_TYPE_LABELS[cajaType],
      icon: CAJA_ICONS[cajaType],
      ...CAJA_RAMA_CHIP_COLORS[cajaType],
    })),
  ];

  /** Get variant color for a caja type */
  getVariantByType(cajaType: CajaType): StatCardVariant {
    return getCajaRamaVariant(cajaType);
  }

  // Current filters (excluding tipoCaja which is handled by chips)
  private currentFilters: MovimientosFilters = {};

  // Table configuration
  readonly movimientosColumns: TableColumn[] = [
    { key: 'fecha', header: 'Fecha', type: 'date', sortable: true },
    { key: 'tipo', header: 'Tipo', type: 'status' },
    { key: 'concepto', header: 'Concepto', type: 'concepto', sortable: true },
    { key: 'descripcion', header: 'Descripcion', type: 'text' },
    { key: 'monto', header: 'Monto', type: 'number', sortable: true },
    { key: 'caja.nombre', header: 'Caja', type: 'text' },
    { key: 'responsable.nombre', header: 'Responsable', type: 'text' },
    {
      key: 'actions',
      header: 'Acciones',
      type: 'action',
      actions: [
        { key: 'view', label: 'Ver', icon: 'visibility' },
        { key: 'edit', label: 'Editar', icon: 'edit' },
      ],
    },
  ];

  // Filter configuration using enums (tipoCaja handled by chips)
  readonly filterConfigs: FilterConfig[] = [
    {
      key: 'tipo',
      type: FilterType.SELECT,
      label: 'Tipo',
      placeholder: 'Todos',
      options: [
        { value: '', label: 'Todos' },
        { value: TipoMovimientoEnum.INGRESO, label: 'Ingresos' },
        { value: TipoMovimientoEnum.EGRESO, label: 'Egresos' },
      ],
    },
    {
      key: 'concepto',
      type: FilterType.SELECT,
      label: 'Concepto',
      placeholder: 'Todos',
      options: [
        { value: '', label: 'Todos los conceptos' },
        ...Object.entries(CONCEPTO_MOVIMIENTO_LABELS).map(([value, label]) => ({
          value: value as ConceptoMovimiento,
          label,
        })),
      ],
    },
    {
      key: 'fecha',
      type: FilterType.DATE_RANGE,
      label: 'Fecha',
    },
  ];

  ngOnInit(): void {
    this.state.loadTodasCajasRama();
    this.loadMovimientos();
  }

  private loadMovimientos(): void {
    this.movimientosLoading.set(true);
    const pagination: PaginationParams = { page: 1, limit: 50 };

    // Merge chip selection with other filters
    const filters: MovimientosFilters = {
      ...this.currentFilters,
      tipoCaja: this.buildTipoCajaFilter(),
    };

    this.movimientosApi.getPaginated(pagination, filters).subscribe({
      next: (response) => {
        this.movimientos.set(response.data);
        this.movimientosLoading.set(false);
      },
      error: () => {
        this.movimientosLoading.set(false);
      },
    });
  }

  onRamaChipsChanged(values: Array<string | number | null>): void {
    this.selectedRamas.set(values);
    this.loadMovimientos();
  }

  onFiltersChanged(filters: Record<string, unknown>): void {
    this.currentFilters = {
      tipo: (filters['tipo'] as TipoMovimientoEnum) || undefined,
      concepto: (filters['concepto'] as ConceptoMovimiento) || undefined,
      fechaInicio: (filters['fecha'] as { start?: string })?.start || undefined,
      fechaFin: (filters['fecha'] as { end?: string })?.end || undefined,
    };
    this.loadMovimientos();
  }

  private buildTipoCajaFilter(): string {
    const selected = this.selectedRamas();
    // If "Todas" (null) is selected or nothing selected, return all rama types
    if (selected.includes(null) || selected.length === 0) {
      return RAMA_CAJA_TYPES.join(',');
    }
    // Filter to only CajaType values (exclude null)
    return selected.filter((v): v is CajaType => v !== null).join(',');
  }

  onRegistrarMovimiento(cajaType: CajaType): void {
    const rama = this.getRamaFromCajaType(cajaType);
    const caja = rama ? this.cajasRama()[rama] : null;
    if (caja) {
      this.router.navigate(['/movimientos/nuevo'], {
        queryParams: { cajaId: caja.id },
      });
    }
  }

  private getRamaFromCajaType(cajaType: CajaType): RamaEnum | null {
    const map: Record<string, RamaEnum> = {
      [CajaType.RAMA_MANADA]: RamaEnum.MANADA,
      [CajaType.RAMA_UNIDAD]: RamaEnum.UNIDAD,
      [CajaType.RAMA_CAMINANTES]: RamaEnum.CAMINANTES,
      [CajaType.RAMA_ROVERS]: RamaEnum.ROVERS,
    };
    return map[cajaType] || null;
  }

  getSaldoByType(cajaType: CajaType): number {
    const saldoMap: Record<string, () => number> = {
      [CajaType.RAMA_MANADA]: () => this.saldoManada(),
      [CajaType.RAMA_UNIDAD]: () => this.saldoUnidad(),
      [CajaType.RAMA_CAMINANTES]: () => this.saldoCaminantes(),
      [CajaType.RAMA_ROVERS]: () => this.saldoRovers(),
    };
    return saldoMap[cajaType]?.() ?? 0;
  }

  onTableAction(event: ActionEvent): void {
    const id = event.row['id'] as string;
    if (event.action === 'view') {
      this.router.navigate(['/movimientos', id]);
    } else if (event.action === 'edit') {
      this.router.navigate(['/movimientos', id, 'editar']);
    }
  }
}
