import { ChangeDetectionStrategy, Component, Input, forwardRef, OnChanges, OnInit, SimpleChanges, ChangeDetectorRef, AfterViewChecked, ElementRef, inject, output, input, viewChild } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Select Field Component - Componente reutilizable para campos de selección
 *
 * @description
 * Componente de formulario reactivo para campos de selección (select) que soporta:
 * - Opciones simples (strings, números)
 * - Objetos con propiedades (optionLabel, optionValue)
 * - Enums de TypeScript
 * - Funciones personalizadas para label y value
 * - Búsqueda/filtrado
 *
 * @important
 * **REGLA CRÍTICA**: Cuando uses `optionLabelFn`, SIEMPRE debes proporcionar también `optionValueFn`
 * para evitar problemas de sincronización de valores en formularios de edición.
 *
 * @example
 * // ✅ CORRECTO: Usando optionLabelFn con optionValueFn para enums
 * <app-select-field
 *   formControlName="role"
 *   [options]="userRoles"
 *   [optionLabelFn]="getRoleDisplayName"
 *   [optionValueFn]="getRoleValue"
 *   placeholder="Seleccionar rol">
 * </app-select-field>
 *
 * // En el componente:
 * getRoleDisplayName(role: UserRole): string {
 *   return getRoleDisplayName(role);
 * }
 * getRoleValue(role: UserRole): string {
 *   return role; // Retorna el valor del enum (ej: 'superadmin', 'admin')
 * }
 *
 * @example
 * // ✅ CORRECTO: Usando optionLabel y optionValue para objetos
 * <app-select-field
 *   formControlName="clientId"
 *   [options]="clients"
 *   optionLabel="name"
 *   optionValue="id"
 *   placeholder="Seleccionar cliente">
 * </app-select-field>
 *
 * @example
 * // ✅ CORRECTO: Usando objetos con value y label
 * <app-select-field
 *   formControlName="sex"
 *   [options]="[
 *     { value: 'M', label: 'Masculino' },
 *     { value: 'F', label: 'Femenino' }
 *   ]"
 *   optionLabel="label"
 *   optionValue="value"
 *   placeholder="Seleccionar sexo">
 * </app-select-field>
 *
 * @example
 * // ❌ INCORRECTO: Usando optionLabelFn sin optionValueFn
 * // Esto causará que el valor no se muestre correctamente en formularios de edición
 * <app-select-field
 *   formControlName="role"
 *   [options]="userRoles"
 *   [optionLabelFn]="getRoleDisplayName"
 *   placeholder="Seleccionar rol">
 * </app-select-field>
 *
 * @notes
 * - El componente normaliza automáticamente los valores para comparación (enums, números, strings)
 * - Soporta sincronización automática cuando las opciones se cargan después del valor inicial
 * - Usa OnPush change detection para mejor rendimiento
 * - Los valores se comparan usando normalización para manejar diferentes tipos de datos
 *
 * @see normalizeValue() Para entender cómo se normalizan los valores para comparación
 */
@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectFieldComponent),
      multi: true,
    },
  ]
})
export class SelectFieldComponent<T = any>
  implements ControlValueAccessor, OnChanges, OnInit, AfterViewChecked {
  private cdr = inject(ChangeDetectorRef);

  @Input() disabled: boolean = false;
  readonly id = input<string>();

  /**
   * Lista de opciones para el select
   * Puede ser un array de strings, números, objetos o enums
   */
  readonly options = input<T[]>([]);

  /**
   * Nombre de la propiedad del objeto que se usará como label
   * Solo se usa si optionLabelFn no está definido
   * @example optionLabel="name" // Para objetos { id: 1, name: "Cliente 1" }
   */
  readonly optionLabel = input<keyof T | null>(null);

  /**
   * Nombre de la propiedad del objeto que se usará como value
   * Solo se usa si optionValueFn no está definido
   * @example optionValue="id" // Para objetos { id: 1, name: "Cliente 1" }
   */
  readonly optionValue = input<keyof T | null>(null);

  /**
   * Función personalizada para obtener el label de una opción
   * Útil para enums o transformaciones complejas
   * @important Si usas optionLabelFn, DEBES proporcionar también optionValueFn
   * @example
   * optionLabelFn="(role: UserRole) => getRoleDisplayName(role)"
   */
  readonly optionLabelFn = input<(option: T) => string>();

  /**
   * Función personalizada para obtener el value de una opción
   * Útil para enums o transformaciones complejas
   * @important OBLIGATORIO cuando se usa optionLabelFn para evitar problemas de sincronización
   * @example
   * optionValueFn="(role: UserRole) => role" // Retorna el valor del enum
   */
  readonly optionValueFn = input<(option: T) => unknown>();
  @Input() placeholder: string = '';
  readonly loading = input<boolean>(false);
  readonly searchable = input<boolean>(false);
  readonly emptyText = input<string>('Sin opciones');
  readonly emptySearchText = input<string>('Sin resultados');
  readonly minSearchLength = input<number>(2);
  readonly debounceTime = input<number>(300);

  readonly search = output<string>();

  readonly selectElement = viewChild<ElementRef<HTMLSelectElement>>('selectElement');

  value: unknown = '';
  searchText: string = '';
  filteredOptions: T[] = [];
  private lastOptionsLength: number = 0;
  private needsValueSync: boolean = false;

  private onChange: (val: unknown) => void = () => { };
  private onTouched: () => void = () => { };

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] || changes['searchable']) {
      const optionsChanged = changes['options'];
      const previousLength = optionsChanged?.previousValue?.length || 0;
      const currentLength = this.options().length;

      this.filteredOptions = this.options();
      if (
        this.searchable() &&
        this.searchText &&
        this.searchText.length >= this.minSearchLength()
      ) {
        this.handleSearch(this.searchText);
      }

      // Si las opciones cambiaron de 0 a más de 0 (se cargaron por primera vez)
      // y tenemos un valor establecido, necesitamos sincronizar el valor
      if (
        optionsChanged &&
        previousLength === 0 &&
        currentLength > 0 &&
        this.value !== null &&
        this.value !== ''
      ) {
        // Verificar si el valor existe en las nuevas opciones
        const normalizedValue = this.normalizeValue(this.value);
        const valueExists = this.options().some(
          (opt) => this.normalizeValue(this.getOptionValue(opt)) === normalizedValue
        );
        if (valueExists) {
          // Marcar que necesitamos sincronizar el valor después de que la vista se actualice
          this.needsValueSync = true;
        }
      }

      // Actualizar el último length conocido
      this.lastOptionsLength = currentLength;

      // Siempre marcar para check cuando cambian las opciones (importante para OnPush)
      this.cdr.markForCheck();
    }
  }

  ngOnInit(): void {
    this.filteredOptions = this.options();
    this.lastOptionsLength = this.options().length;
  }

  ngAfterViewChecked(): void {
    // Sincronizar el valor del select HTML cuando las opciones se cargan después del valor
    const selectElement = this.selectElement();
    if (this.needsValueSync && selectElement?.nativeElement) {
      const select = selectElement.nativeElement;
      const currentValue = this.normalizeValue(this.value);

      // Verificar si el valor actual del select no coincide con el valor esperado
      if (select.value !== currentValue) {
        // Buscar la opción que coincide con el valor
        const matchingOption = Array.from(select.options).find(
          (option) => this.normalizeValue(option.value) === currentValue
        );

        if (matchingOption) {
          // Establecer el valor directamente en el select HTML
          select.value = matchingOption.value;
          // Disparar evento change para notificar a Angular
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      // Resetear la bandera después de sincronizar
      this.needsValueSync = false;
    }
  }

  /**
   * Normaliza un valor para comparación (convierte a string de forma consistente)
   *
   * @description
   * Este método es crítico para la correcta sincronización de valores en el select.
   * Convierte diferentes tipos de valores a strings de forma consistente para permitir
   * la comparación correcta entre el valor del formulario y los valores de las opciones.
   *
   * @param val - Valor a normalizar (puede ser string, number, boolean, enum, objeto, null, undefined)
   * @returns String normalizado para comparación
   *
   * @example
   * normalizeValue('M') // 'M'
   * normalizeValue(Sex.M) // 'M' (enum de TypeScript)
   * normalizeValue(123) // '123' (número)
   * normalizeValue({ value: 'M', label: 'Masculino' }) // 'M' (objeto con propiedad value)
   * normalizeValue(null) // '' (vacío)
   *
   * @notes
   * - Los enums de TypeScript se convierten directamente a su valor string
   * - Los números se convierten a string
   * - Los objetos con propiedad 'value' usan ese valor
   * - null/undefined se convierten a string vacío
   */
  normalizeValue(val: unknown): string {
    if (val === null || val === undefined) return '';

    // Si es un número, convertir a string directamente
    if (typeof val === 'number') {
      return String(val);
    }

    // Si es un boolean, convertir a string
    if (typeof val === 'boolean') {
      return String(val);
    }

    // Si es un string, devolverlo directamente
    if (typeof val === 'string') {
      return val;
    }

    // Si es un objeto/enum, intentar obtener su valor primitivo
    if (typeof val === 'object' && val !== null) {
      // Si tiene una propiedad 'value', usarla (para objetos como { value: 'M', label: 'Masculino' })
      if ('value' in val && typeof (val as any).value !== 'object') {
        return String((val as any).value);
      }

      // Para enums de TypeScript, el valor ya es el string/número primitivo
      // Los enums de TypeScript se convierten a string directamente con String()
      // Ejemplo: String(Sex.M) === 'M'
      const stringValue = String(val);

      // Si el string resultante parece un enum (contiene el nombre del enum), intentar extraer el valor
      // Pero en realidad, los enums de TypeScript cuando se convierten a string dan el valor directamente
      // Sex.M === 'M', entonces String(Sex.M) === 'M'
      return stringValue;
    }

    // Para otros tipos, convertir a string
    return String(val);
  }

  /**
   * Implementación de ControlValueAccessor.writeValue
   * Se llama cuando el FormControl establece un valor (especialmente en formularios de edición)
   *
   * @description
   * Este método es crítico para la correcta visualización de valores en formularios de edición.
   * Cuando un formulario se popula con datos existentes, este método recibe el valor del FormControl
   * y lo sincroniza con el select HTML.
   *
   * @important
   * - Si usas optionLabelFn sin optionValueFn, el valor puede no sincronizarse correctamente
   * - El método normaliza los valores para comparación (maneja enums, números, strings)
   * - Si las opciones aún no están cargadas, marca para sincronizar cuando lleguen
   *
   * @param val - Valor del FormControl (puede ser string, number, enum, etc.)
   *
   * @example
   * // Cuando se popula un formulario de edición:
   * this.userForm.patchValue({ role: UserRole.ADMIN });
   * // writeValue recibe UserRole.ADMIN y lo sincroniza con el select
   */
  writeValue(val: unknown): void {
    const newValue = val ?? '';
    // Solo actualizar si el valor cambió para evitar ciclos innecesarios
    if (this.value !== newValue) {
      this.value = newValue;

      // Si hay opciones disponibles, verificar que el valor existe y sincronizar
      if (this.options().length > 0 && newValue !== '') {
        const normalizedNewValue = this.normalizeValue(newValue);
        const valueExists = this.options().some(
          (opt) => this.normalizeValue(this.getOptionValue(opt)) === normalizedNewValue
        );
        // Si el valor existe, marcar para sincronizar inmediatamente
        if (valueExists) {
          this.needsValueSync = true;
        }
      } else if (newValue !== '' && this.options().length === 0) {
        // Si el valor se establece antes de que las opciones estén disponibles, marcar para sincronizar
        this.needsValueSync = true;
      }

      // Forzar detección de cambios con OnPush cuando se recibe valor del FormControl
      this.cdr.markForCheck();
    }
  }

  registerOnChange(fn: (val: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleChange(newValue: string): void {
    this.value = newValue;
    this.onChange(newValue);
  }

  handleBlur(): void {
    this.onTouched();
  }

  handleSearch(text: string): void {
    this.searchText = text;

    if (text.length < this.minSearchLength()) {
      this.filteredOptions = this.options();
      return;
    }

    this.filteredOptions = this.filterOptions(text);
    this.search.emit(text);
  }

  private filterOptions(searchText: string): T[] {
    if (!this.searchable() || !searchText) {
      return this.options();
    }

    const lowerSearch = searchText.toLowerCase();
    return this.options().filter((option) => {
      const label = this.getOptionLabel(option).toLowerCase();
      return label.includes(lowerSearch);
    });
  }

  getDisplayOptions(): T[] {
    if (this.searchable() && this.searchText.length >= this.minSearchLength()) {
      return this.filteredOptions;
    }
    return this.options();
  }

  hasSearchResults(): boolean {
    if (!this.searchable()) return true;
    if (this.searchText.length < this.minSearchLength()) return true;
    return this.filteredOptions.length > 0;
  }

  /**
   * Obtiene el label (texto visible) de una opción
   *
   * @description
   * Prioridad de resolución:
   * 1. optionLabelFn (si está definido)
   * 2. optionLabel (propiedad del objeto)
   * 3. String del objeto completo
   *
   * @param option - Opción de la cual obtener el label
   * @returns String con el label a mostrar
   */
  getOptionLabel(option: T): string {
    const optionLabelFn = this.optionLabelFn();
    if (optionLabelFn) return optionLabelFn(option);
    const optionLabel = this.optionLabel();
    if (optionLabel) return String((option as any)[optionLabel]);
    return String(option);
  }

  /**
   * Obtiene el value (valor del formulario) de una opción
   *
   * @description
   * Prioridad de resolución:
   * 1. optionValueFn (si está definido) - RECOMENDADO cuando se usa optionLabelFn
   * 2. optionValue (propiedad del objeto)
   * 3. El objeto completo
   *
   * @important
   * Si usas optionLabelFn, SIEMPRE proporciona optionValueFn para evitar problemas
   * de sincronización en formularios de edición.
   *
   * @param option - Opción de la cual obtener el value
   * @returns Valor que se asignará al FormControl cuando se seleccione esta opción
   */
  getOptionValue(option: T): unknown {
    const optionValueFn = this.optionValueFn();
    if (optionValueFn) return optionValueFn(option);
    const optionValue = this.optionValue();
    if (optionValue) return (option as any)[optionValue];
    return option as any;
  }
}
