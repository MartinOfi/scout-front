import { OverlayModule } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  Signal,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ActiveFilter } from './active-filter.interface';
import { ActiveFilterChipComponent } from './components/active-filter-chip/active-filter-chip.component';
import { FilterFormPanelComponent } from './components/filter-form-panel/filter-form-panel.component';
import { FilterTriggerButtonComponent } from './components/filter-trigger-button/filter-trigger-button.component';
import { FILTER_LABELS } from './config/filter-labels.config';
import { getDefaultOperator } from './config/filter-operators.config';
import { FilterConfig } from './filter-config.interface';
import { FilterValue, FilterValueMap } from './filter-value.type';
import { ActiveFiltersStore } from './services/active-filters.store';
import { hasActiveValue } from './utils/filter-active-state.util';

/**
 * Componente de filtros genérico y configurable (rediseño minimalista).
 *
 * Layout de una sola fila con chips + botón "Filtrar" + "Limpiar".
 *
 * ## API pública (retrocompatible):
 * - `filterConfigs`, `initialValues`, `autoApply` — inputs
 * - `showClearButton`, `showApplyButton`, `inline` — inputs (se preservan por compat)
 * - `filtersChanged`, `filterCleared` — outputs
 * - `onApplyFilters()`, `onClearFilters()`, `getFilterConfig()`, `isFilterActive()` — métodos
 *
 * @see ActiveFiltersStore estado local
 * @see FilterFormPanelComponent form inline con live filtering
 * @see ActiveFilterChipComponent chip read-only con remove on hover
 */
@Component({
  selector: 'app-generic-filters',
  standalone: true,
  imports: [
    OverlayModule,
    FilterTriggerButtonComponent,
    FilterFormPanelComponent,
    ActiveFilterChipComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ActiveFiltersStore],
  templateUrl: './generic-filters.component.html',
  styleUrl: './generic-filters.component.scss',
})
export class GenericFiltersComponent implements OnInit {
  private readonly store = inject(ActiveFiltersStore);

  private _filterConfigs: readonly FilterConfig[] = [];
  private _initialValues: Readonly<Record<string, FilterValue>> = {};
  private lastEmittedSnapshot: string | null = null;
  private hydrated = false;

  @Input()
  get filterConfigs(): readonly FilterConfig[] {
    return this._filterConfigs;
  }
  set filterConfigs(value: readonly FilterConfig[]) {
    this._filterConfigs = value ?? [];
    if (this.hydrated) {
      this.reconcileConfigsChange();
    }
  }

  @Input()
  get initialValues(): Readonly<Record<string, FilterValue>> {
    return this._initialValues;
  }
  set initialValues(value: Readonly<Record<string, FilterValue>>) {
    this._initialValues = value ?? {};
    // Post-hydration changes to `initialValues` are intentionally ignored:
    // once the component is mounted, the store becomes the source of truth
    // for user-applied state. Changing defaults at runtime should not clobber it.
  }

  @Input() autoApply = true;

  readonly showClearButton = input<boolean>(true);
  readonly showApplyButton = input<boolean>(false);
  readonly inline = input<boolean>(false);

  readonly filtersChanged = output<FilterValueMap>();
  readonly filterCleared = output<void>();

  protected readonly popoverOpen = signal<boolean>(false);
  protected readonly labels = FILTER_LABELS;

  protected readonly activeFilters: Signal<readonly ActiveFilter[]> = this.store.list;
  protected readonly hasActiveFilters: Signal<boolean> = this.store.hasActive;
  protected readonly activeCount = computed(() => this.activeFilters().length);
  protected readonly currentValueMap: Signal<FilterValueMap> = this.store.valueMap;

  protected readonly availableConfigs = computed(() => {
    const activeKeys = new Set(this.activeFilters().map((f) => f.key));
    return this._filterConfigs.filter((c) => !activeKeys.has(c.key));
  });

  constructor() {
    effect(() => {
      if (!this.autoApply) {
        return;
      }
      const valueMap = this.store.valueMap();
      const snapshot = JSON.stringify(valueMap);
      if (snapshot === this.lastEmittedSnapshot) {
        return;
      }
      this.lastEmittedSnapshot = snapshot;
      this.filtersChanged.emit(valueMap);
    });
  }

  ngOnInit(): void {
    this.hydrateFromInitial();
    this.hydrated = true;
  }

  // ===== public API (preserved) =====

  onApplyFilters(): void {
    const valueMap = this.store.valueMap();
    this.lastEmittedSnapshot = JSON.stringify(valueMap);
    this.filtersChanged.emit(valueMap);
  }

  onClearFilters(): void {
    this.store.clear();
    this.filterCleared.emit();
    // The effect emits `filtersChanged` once the store signal updates.
  }

  getFilterConfig(key: string): FilterConfig | undefined {
    return this._filterConfigs.find((c) => c.key === key);
  }

  isFilterActive(key: string): boolean {
    return hasActiveValue(this.store.valueMap()[key]);
  }

  toggleExpanded(): void {
    // No-op: kept for API compatibility; the compact design has no expand/collapse.
  }

  // ===== popover handlers =====

  protected onTriggerClick(): void {
    this.popoverOpen.set(true);
  }

  protected onOverlayBackdropClick(): void {
    this.popoverOpen.set(false);
  }

  /**
   * Live reconciliation: se invoca cada vez que el form panel detecta cambios
   * (debounciados). Agrega o actualiza los filtros presentes y remueve los
   * que quedaron vacíos. **No cierra** el popover — el usuario sigue editando.
   *
   * Preserva el `operator` existente si el filtro ya está en el store, para no
   * pisar operadores que el usuario haya cambiado manualmente.
   */
  protected onFormSubmitted(values: FilterValueMap): void {
    const presentKeys = new Set(Object.keys(values));
    const existingByKey = new Map(this.store.list().map((f) => [f.key, f]));
    for (const active of this.store.list()) {
      if (this.isManagedByFormPanel(active.key) && !presentKeys.has(active.key)) {
        this.store.remove(active.key);
      }
    }
    for (const config of this._filterConfigs) {
      const value = values[config.key];
      if (value === undefined) {
        continue;
      }
      const existing = existingByKey.get(config.key);
      this.store.add({
        key: config.key,
        type: config.type,
        label: config.label,
        operator: existing?.operator ?? getDefaultOperator(config.type),
        value,
      });
    }
  }

  private isManagedByFormPanel(key: string): boolean {
    return this._filterConfigs.some((c) => c.key === key);
  }

  protected onChipRemoved(key: string): void {
    this.store.remove(key);
  }

  // ===== internal =====

  private hydrateFromInitial(): void {
    if (this._filterConfigs.length === 0) {
      return;
    }
    const filters: ActiveFilter[] = [];
    for (const config of this._filterConfigs) {
      const raw = this.resolveInitialValue(config);
      if (raw === undefined || !hasActiveValue(raw)) {
        continue;
      }
      filters.push({
        key: config.key,
        type: config.type,
        label: config.label,
        operator: getDefaultOperator(config.type),
        value: raw,
      });
    }
    this.store.hydrate(filters);
    // Nota: NO sembramos `lastEmittedSnapshot` aquí — el effect debe emitir
    // la hidratación inicial una vez para que el consumidor dispare su primer
    // fetch con los filtros activos. El dedupe por snapshot evita re-emisiones
    // idénticas posteriores (e.g. cuando el popover abre y el CVA re-sincroniza).
  }

  /**
   * Reconciliación cuando `filterConfigs` cambia después del mount.
   *
   * - Remueve filtros activos cuya `key` ya no existe en los configs.
   * - Preserva el estado de usuario para las keys que permanecen.
   * - No re-aplica `defaultValue` de los configs nuevos (sería sorprendente
   *   agregar un filtro que el usuario no pidió).
   */
  private reconcileConfigsChange(): void {
    const validKeys = new Set(this._filterConfigs.map((c) => c.key));
    for (const active of this.store.list()) {
      if (!validKeys.has(active.key)) {
        this.store.remove(active.key);
      }
    }
  }

  private resolveInitialValue(config: FilterConfig): FilterValue | undefined {
    const fromInitial = this._initialValues[config.key];
    if (fromInitial !== undefined) {
      return fromInitial;
    }
    const fromDefault = config.defaultValue;
    if (fromDefault === undefined || fromDefault === null) {
      return undefined;
    }
    return fromDefault as FilterValue;
  }
}
