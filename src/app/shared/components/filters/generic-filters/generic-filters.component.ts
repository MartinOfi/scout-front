/**
 * Componente de filtros genérico y configurable
 *
 * Basado en las especificaciones del todo.md líneas 44-74
 * Componente reutilizable que permite definir dinámicamente qué tipos de filtros mostrar
 *
 * @example
 * ```typescript
 * // Configuración básica
 * filterConfigs: FilterConfig[] = [
 *   {
 *     key: 'search',
 *     type: FilterType.TEXT,
 *     label: 'Buscar',
 *     placeholder: 'Buscar...',
 *     defaultValue: '',
 *   },
 *   {
 *     key: 'status',
 *     type: FilterType.SELECT,
 *     label: 'Estado',
 *     options: [
 *       { value: '', label: 'Todos los estados' },
 *       { value: 'active', label: 'Activo' },
 *       { value: 'inactive', label: 'Inactivo' },
 *     ],
 *     defaultValue: '',
 *   },
 * ];
 *
 * // Uso en template
 * <app-generic-filters
 *   [filterConfigs]="filterConfigs"
 *   [initialValues]="initialFilterValues"
 *   [autoApply]="true"
 *   [showClearButton]="true"
 *   (filtersChanged)="onFiltersChanged($event)"
 *   (filterCleared)="onFilterCleared()">
 * </app-generic-filters>
 * ```
 *
 * @example
 * ```typescript
 * // Manejo de filtros en el componente padre
 * onFiltersChanged(filters: Record<string, any>): void {
 *   const validatedFilters: Partial<DataFilters> = {};
 *
 *   // Validar y limpiar cada filtro
 *   if (filters.search && filters.search.trim() !== '') {
 *     validatedFilters.search = filters.search.trim();
 *   }
 *
 *   if (filters.status && filters.status !== '') {
 *     validatedFilters.status = filters.status;
 *   }
 *
 *   this.applyFilters(validatedFilters);
 * }
 *
 * private applyFilters(filters: Partial<DataFilters>): void {
 *   // Limpiar filtros undefined
 *   Object.keys(filters).forEach(key => {
 *     const filterKey = key as keyof DataFilters;
 *     if (filters[filterKey] === undefined) {
 *       delete this.filters[filterKey];
 *     } else {
 *       (this.filters as any)[filterKey] = filters[filterKey];
 *     }
 *   });
 *
 *   this.currentPage = 1;
 *   this.loadData();
 * }
 * ```
 */

import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, signal, computed, inject, output, input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

import { Subject, takeUntil } from 'rxjs';
import { SelectFieldComponent } from '../../form/select-field/select-field.component';
import { DateFieldComponent } from '../../form/date-field/date-field.component';
import { TextFieldComponent } from '../../form/text-field/text-field.component';
import { NumberFieldComponent } from '../../form/number-field/number-field.component';
import { CheckboxFieldComponent } from '../../form/checkbox-field/checkbox-field.component';
import { ChipsFilterComponent } from '../chips-filter/chips-filter.component';
import { FilterConfig } from './filter-config.interface';
import { FilterType } from './filter-type.enum';

/**
 * Componente de filtros genérico y configurable
 *
 * Proporciona interfaz para filtrar datos de forma dinámica
 * según configuración proporcionada via FilterConfig[]
 *
 * ## Características:
 * - ✅ Soporte para 9 tipos de filtros diferentes
 * - ✅ Configuración dinámica via FilterConfig[]
 * - ✅ Validación automática de formularios
 * - ✅ Signals para estado reactivo (Angular 17+)
 * - ✅ OnPush change detection para performance
 * - ✅ Auto-aplicación de filtros opcional
 * - ✅ Persistencia de valores iniciales
 * - ✅ Limpieza automática de filtros
 *
 * ## Tipos de Filtros Soportados:
 * - `SELECT`: Lista desplegable simple
 * - `MULTI_SELECT`: Selección múltiple con checkboxes
 * - `TEXT`: Campo de texto libre
 * - `NUMBER`: Campo numérico
 * - `DATE`: Selector de fecha
 * - `DATE_RANGE`: Rango de fechas
 * - `BOOLEAN`: Checkbox simple
 * - `SEARCH`: Campo de búsqueda con debounce
 * - `CUSTOM`: Componente personalizado
 *
 * ## Mejores Prácticas:
 *
 * ### 1. Configuración de Filtros
 * ```typescript
 * filterConfigs: FilterConfig[] = [
 *   {
 *     key: 'search',
 *     type: FilterType.TEXT,
 *     label: 'Buscar',
 *     placeholder: 'Buscar...',
 *     defaultValue: '', // Siempre definir valor por defecto
 *   },
 *   {
 *     key: 'status',
 *     type: FilterType.SELECT,
 *     label: 'Estado',
 *     options: [
 *       { value: '', label: 'Todos los estados' }, // Opción para limpiar
 *       { value: 'active', label: 'Activo' },
 *       { value: 'inactive', label: 'Inactivo' },
 *     ],
 *     defaultValue: '', // Valor por defecto
 *   },
 * ];
 * ```
 *
 * ### 2. Manejo de Filtros en Componente Padre
 * ```typescript
 * onFiltersChanged(filters: Record<string, any>): void {
 *   const validatedFilters: Partial<DataFilters> = {};
 *
 *   // Validar y limpiar cada filtro
 *   if (filters.search && filters.search.trim() !== '') {
 *     validatedFilters.search = filters.search.trim();
 *   }
 *
 *   if (filters.status && filters.status !== '') {
 *     validatedFilters.status = filters.status;
 *   }
 *
 *   this.applyFilters(validatedFilters);
 * }
 *
 * private applyFilters(filters: Partial<DataFilters>): void {
 *   // Limpiar filtros undefined
 *   Object.keys(filters).forEach(key => {
 *     const filterKey = key as keyof DataFilters;
 *     if (filters[filterKey] === undefined) {
 *       delete this.filters[filterKey];
 *     } else {
 *       (this.filters as any)[filterKey] = filters[filterKey];
 *     }
 *   });
 *
 *   this.currentPage = 1; // Resetear página
 *   this.loadData();
 * }
 * ```
 *
 * ### 3. Limpieza de Filtros
 * ```typescript
 * clearFilters(): void {
 *   this.filters = {};
 *   this.initialFilterValues = {}; // Limpiar valores iniciales
 *   this.currentPage = 1;
 *   this.loadData();
 * }
 *
 * onFilterCleared(): void {
 *   this.initialFilterValues = {}; // Limpiar valores iniciales
 *   this.clearFilters();
 * }
 * ```
 *
 * ## Errores Comunes a Evitar:
 *
 * ❌ **No limpiar filtros undefined**
 * ```typescript
 * // INCORRECTO
 * onFiltersChanged(filters: Record<string, any>): void {
 *   this.filters = filters; // Mantiene propiedades undefined
 * }
 * ```
 *
 * ❌ **No manejar valores vacíos en SELECT**
 * ```typescript
 * // INCORRECTO
 * if (filters.role) {
 *   this.filters.role = filters.role; // No maneja valores vacíos
 * }
 * ```
 *
 * ❌ **No resetear página al aplicar filtros**
 * ```typescript
 * // INCORRECTO
 * onFiltersChanged(filters: Record<string, any>): void {
 *   this.filters = filters;
 *   this.loadData(); // Mantiene página actual
 * }
 * ```
 *
 * ❌ **patchValue disparando valueChanges (Múltiples Requests)**
 * ```typescript
 * // INCORRECTO - Causa múltiples requests
 * private initializeFilters(): void {
 *   this.filtersForm.patchValue(formValue); // ← Dispara valueChanges
 * }
 * ```
 *
 * ❌ **Effect en constructor causando requests inmediatos**
 * ```typescript
 * // INCORRECTO - Causa request inmediato
 * constructor(private fb: FormBuilder) {
 *   effect(() => {
 *     if (this.autoApply) {
 *       this.applyFilters(); // ← Request inmediato
 *     }
 *   });
 * }
 * ```
 *
 * ❌ **Múltiples suscripciones en setupAutoFiltering**
 * ```typescript
 * // INCORRECTO - Sin control de suscripciones
 * private setupAutoFiltering(): void {
 *   this.filtersForm.valueChanges.subscribe(() => {}); // ← Múltiples suscripciones
 * }
 * ```
 *
 * @see {@link FilterConfig} Para configuración de filtros
 * @see {@link FilterType} Para tipos de filtros disponibles
 * @see {@link docs/generic-filters-usage-example.md} Para ejemplos completos
 */
@Component({
  selector: 'app-generic-filters',
  standalone: true,
  templateUrl: './generic-filters.component.html',
  styleUrls: ['./generic-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    NgClass,
    SelectFieldComponent,
    DateFieldComponent,
    TextFieldComponent,
    NumberFieldComponent,
    CheckboxFieldComponent,
    ChipsFilterComponent
  ]
})
export class GenericFiltersComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  private _filterConfigs: FilterConfig[] = [];
  private _initialValues: Record<string, any> = {};
  private destroy$ = new Subject<void>();

  /**
   * Signal para controlar el estado de expansión/colapso
   */
  readonly isExpanded = signal(true);

  /**
   * Configuraciones de filtros
   * @description Define qué tipos de filtros mostrar y cómo configurarlos
   * @example
   * ```typescript
   * filterConfigs: FilterConfig[] = [
   *   {
   *     key: 'search',
   *     type: FilterType.TEXT,
   *     label: 'Buscar',
   *     placeholder: 'Buscar...',
   *     defaultValue: '',
   *   }
   * ];
   * ```
   */
  @Input()
  get filterConfigs(): FilterConfig[] {
    return this._filterConfigs;
  }
  set filterConfigs(value: FilterConfig[]) {
    this._filterConfigs = value;
    // Solo reconstruir si ya se inicializó el componente
    if (this.filtersForm) {
      this.rebuildForm();
    }
  }

  /**
   * Valores iniciales de los filtros
   * @description Valores por defecto que se aplicarán al inicializar el componente
   * @example
   * ```typescript
   * initialValues = {
   *   search: 'término inicial',
   *   status: 'active'
   * };
   * ```
   */
  @Input()
  get initialValues(): Record<string, any> {
    return this._initialValues;
  }
  set initialValues(value: Record<string, any>) {
    this._initialValues = value;
    // Solo inicializar si ya se inicializó el componente
    if (this.filtersForm) {
      this.initializeFilters();
    }
  }

  /**
   * Si aplicar filtros automáticamente
   * @description Cuando es true, los filtros se aplican automáticamente al cambiar valores.
   * Cuando es false, se requiere presionar el botón "Aplicar"
   * @default true
   */
  @Input() autoApply: boolean = true;

  /**
   * Si mostrar botón de limpiar
   * @description Muestra un botón para limpiar todos los filtros
   * @default true
   */
  readonly showClearButton = input<boolean>(true);

  /**
   * Si mostrar botón de aplicar
   * @description Muestra un botón para aplicar filtros manualmente (útil cuando autoApply es false)
   * @default false
   */
  readonly showApplyButton = input<boolean>(false);

  /**
   * Evento emitido cuando cambian los filtros
   * @description Se emite cada vez que cambian los valores de los filtros
   * @param filters Objeto con los valores actuales de todos los filtros
   * @example
   * ```typescript
   * onFiltersChanged(filters: Record<string, any>): void {
   *   console.log('Filtros aplicados:', filters);
   *   // Aplicar filtros a la lógica de negocio
   * }
   * ```
   */
  readonly filtersChanged = output<Record<string, any>>();

  /**
   * Evento emitido cuando se limpian los filtros
   * @description Se emite cuando el usuario presiona el botón "Limpiar Filtros"
   * @example
   * ```typescript
   * onFilterCleared(): void {
   *   console.log('Filtros limpiados');
   *   // Limpiar datos filtrados
   * }
   * ```
   */
  readonly filterCleared = output<void>();

  /** Formulario de filtros */
  filtersForm: FormGroup;

  /** Variable para evitar múltiples suscripciones */
  private isAutoFilteringSetup = false;

  /** Signals para estado reactivo */
  filters = signal<Record<string, any>>({});
  hasActiveFilters = computed(() => {
    const currentFilters = this.filters();
    return Object.values(currentFilters).some(
      (value) =>
        value !== null && value !== undefined && value !== '' && value !== false
    );
  });

  /** Enum de tipos de filtros para template */
  FilterType = FilterType;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.filtersForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeFilters();
    this.setupAutoFiltering();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Crear formulario de filtros dinámicamente
   */
  private createForm(): FormGroup {
    const formControls: Record<string, any> = {};

    if (this.filterConfigs && this.filterConfigs.length > 0) {
      this.filterConfigs.forEach((config) => {
        // Para DATE_RANGE, crear dos controles: Start y End (camelCase)
        if (config.type === FilterType.DATE_RANGE) {
          formControls[config.key + 'Start'] = [config.defaultValue?.startDate || ''];
          formControls[config.key + 'End'] = [config.defaultValue?.endDate || ''];
        } else {
          formControls[config.key] = [config.defaultValue || ''];
        }
      });
    }

    return this.fb.group(formControls);
  }

  /**
   * Reconstruir formulario cuando cambian las configuraciones
   */
  private rebuildForm(): void {
    // Limpiar suscripción anterior
    this.destroy$.next();
    this.destroy$.complete();

    // Crear nuevo Subject para la nueva suscripción
    this.destroy$ = new Subject<void>();

    // Recrear formulario
    this.filtersForm = this.createForm();
    this.initializeFilters();

    // Reconfigurar auto-filtering
    this.isAutoFilteringSetup = false;
    this.setupAutoFiltering();
  }

  /**
   * Inicializar filtros con valores por defecto
   */
  private initializeFilters(): void {
    if (!this.filtersForm || !this.filterConfigs.length) {
      return;
    }

    const formValue: Record<string, any> = {};
    const processedFilters: Record<string, any> = {};

    this.filterConfigs.forEach((config) => {
      // Para DATE_RANGE, inicializar los dos controles Start y End (camelCase)
      if (config.type === FilterType.DATE_RANGE) {
        const dateRangeValue = this.initialValues[config.key] || config.defaultValue || {};
        const startDate = dateRangeValue.startDate || '';
        const endDate = dateRangeValue.endDate || '';
        formValue[config.key + 'Start'] = startDate;
        formValue[config.key + 'End'] = endDate;
        // Procesar para el signal de filtros
        if (startDate || endDate) {
          processedFilters[config.key] = {
            startDate: startDate || null,
            endDate: endDate || null,
          };
        }
      } else {
        const value = this.initialValues[config.key] || config.defaultValue || '';
        formValue[config.key] = value;
        processedFilters[config.key] = value;
      }
    });

    // Usar patchValue sin emitir eventos para evitar valueChanges
    this.filtersForm.patchValue(formValue, { emitEvent: false });
    this.filters.set(processedFilters);
  }

  /**
   * Configurar filtrado automático
   */
  private setupAutoFiltering(): void {
    // Evitar múltiples suscripciones
    if (this.isAutoFilteringSetup || !this.filtersForm) return;

    this.filtersForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((formValue) => {
        // Procesar valores para DATE_RANGE antes de establecer el signal
        const processedFilters: Record<string, any> = {};
        this.filterConfigs.forEach((config) => {
          if (config.type === FilterType.DATE_RANGE) {
            const startDate = formValue[config.key + 'Start'];
            const endDate = formValue[config.key + 'End'];
            if (startDate || endDate) {
              processedFilters[config.key] = {
                startDate: startDate || null,
                endDate: endDate || null,
              };
            }
          } else {
            processedFilters[config.key] = formValue[config.key];
          }
        });
        this.filters.set(processedFilters);
        if (this.autoApply) {
          this.applyFilters();
        }
      });

    this.isAutoFilteringSetup = true;
  }

  /**
   * Aplicar filtros
   */
  private applyFilters(): void {
    const formValue = this.filtersForm.value;
    const processedFilters: Record<string, any> = {};

    // Procesar los valores del formulario, combinando Start y End para DATE_RANGE
    this.filterConfigs.forEach((config) => {
      if (config.type === FilterType.DATE_RANGE) {
        // Combinar Start y End en un objeto dateRange (camelCase)
        const startDate = formValue[config.key + 'Start'];
        const endDate = formValue[config.key + 'End'];
        if (startDate || endDate) {
          processedFilters[config.key] = {
            startDate: startDate || null,
            endDate: endDate || null,
          };
        }
      } else {
        processedFilters[config.key] = formValue[config.key];
      }
    });

    this.filtersChanged.emit(processedFilters);
  }

  /**
   * Aplicar filtros manualmente
   * @description Método público para aplicar filtros cuando autoApply es false
   * @example
   * ```typescript
   * // En el template
   * <button (click)="filtersComponent.onApplyFilters()">Aplicar</button>
   * ```
   */
  onApplyFilters(): void {
    this.applyFilters();
  }

  /**
   * Limpiar todos los filtros
   * @description Resetea todos los filtros a sus valores por defecto y emite el evento filterCleared
   * @example
   * ```typescript
   * // En el template
   * <button (click)="filtersComponent.onClearFilters()">Limpiar</button>
   * ```
   */
  onClearFilters(): void {
    if (!this.filtersForm || !this.filterConfigs.length) {
      return;
    }

    const clearedValues: Record<string, any> = {};
    const processedFilters: Record<string, any> = {};

    this.filterConfigs.forEach((config) => {
      // Para DATE_RANGE, limpiar los dos controles Start y End (camelCase)
      if (config.type === FilterType.DATE_RANGE) {
        const defaultValue = config.defaultValue || {};
        const startDate = defaultValue.startDate || '';
        const endDate = defaultValue.endDate || '';
        clearedValues[config.key + 'Start'] = startDate;
        clearedValues[config.key + 'End'] = endDate;
        // Procesar para el signal de filtros
        if (startDate || endDate) {
          processedFilters[config.key] = {
            startDate: startDate || null,
            endDate: endDate || null,
          };
        }
      } else {
        const value = config.defaultValue || '';
        clearedValues[config.key] = value;
        processedFilters[config.key] = value;
      }
    });

    // Usar patchValue sin emitir eventos para evitar valueChanges
    this.filtersForm.patchValue(clearedValues, { emitEvent: false });
    this.filters.set(processedFilters);
    // TODO: The 'emit' function requires a mandatory void argument
    this.filterCleared.emit();

    if (this.autoApply) {
      this.applyFilters();
    }
  }

  /**
   * Obtener configuración de filtro por clave
   * @param key Clave del filtro a buscar
   * @returns Configuración del filtro o undefined si no se encuentra
   * @example
   * ```typescript
   * const searchConfig = this.getFilterConfig('search');
   * if (searchConfig) {
   *   console.log('Filtro de búsqueda encontrado:', searchConfig.label);
   * }
   * ```
   */
  getFilterConfig(key: string): FilterConfig | undefined {
    return this.filterConfigs.find((config) => config.key === key);
  }

  /**
   * Verificar si un filtro está activo
   * @param key Clave del filtro a verificar
   * @returns true si el filtro tiene un valor activo (no vacío, null, undefined o false)
   * @example
   * ```typescript
   * if (this.isFilterActive('search')) {
   *   console.log('El filtro de búsqueda está activo');
   * }
   * ```
   */
  isFilterActive(key: string): boolean {
    const value = this.filters()[key];
    return (
      value !== null && value !== undefined && value !== '' && value !== false
    );
  }

  /**
   * Manejar cambio en multi-select
   * @description Método interno para manejar cambios en filtros de tipo MULTI_SELECT
   * @param key Clave del filtro multi-select
   * @param event Evento del checkbox
   * @example
   * ```typescript
   * // Se llama automáticamente desde el template
   * <input
   *   type="checkbox"
   *   [value]="option.value"
   *   (change)="onMultiSelectChange('tags', $event)">
   * ```
   */
  onMultiSelectChange(key: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentValue = this.filtersForm.get(key)?.value || [];
    let newValue: any[];

    if (target.checked) {
      newValue = [...currentValue, target.value];
    } else {
      newValue = currentValue.filter((v: any) => v !== target.value);
    }

    this.filtersForm.get(key)?.setValue(newValue);
  }

  /**
   * Manejar selección de chip (selección única)
   * @description Método para manejar eventos de selección única de chips
   * @param key Clave del filtro de chips
   * @param value Valor seleccionado del chip
   */
  onChipSelected(key: string, value: string | number | null): void {
    this.filtersForm.get(key)?.setValue(value);
  }

  /**
   * Manejar selección múltiple de chips
   * @description Método para manejar eventos de selección múltiple de chips
   * @param key Clave del filtro de chips
   * @param values Valores seleccionados de los chips
   */
  onChipsSelected(key: string, values: Array<string | number | null>): void {
    this.filtersForm.get(key)?.setValue(values);
  }

  /**
   * Obtener servicio de configuración de chips si está especificado
   * @description Método helper para obtener el servicio de configuración opcional
   * @param serviceName Nombre del servicio (opcional)
   * @returns Instancia del servicio o undefined
   */
  getChipConfigService(serviceName?: string): any {
    // Por ahora retornar undefined, se puede extender en el futuro
    // si se necesita inyección dinámica de servicios
    return undefined;
  }

  /**
   * Toggle del estado de expansión/colapso
   * @description Alterna entre mostrar y ocultar los filtros
   */
  toggleExpanded(): void {
    this.isExpanded.set(!this.isExpanded());
  }
}
