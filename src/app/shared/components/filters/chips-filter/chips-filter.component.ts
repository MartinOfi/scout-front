import { Component, Input, OnInit, OnChanges, SimpleChanges, output, input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ChipConfig } from './chip-config.interface';

/**
 * Componente genérico reutilizable para filtros usando chips
 *
 * Muestra chips clickeables para filtrar por valores genéricos (períodos, estados, tipos, etc.).
 * Inspirado en status-chips-filter pero genérico y configurable.
 */
@Component({
  selector: 'app-chips-filter',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule],
  templateUrl: './chips-filter.component.html',
  styleUrls: ['./chips-filter.component.scss']
})
export class ChipsFilterComponent implements OnInit, OnChanges {
  /** Array de chips a mostrar */
  @Input() chips: ChipConfig[] = [];

  /** Valor seleccionado (selección única) */
  @Input() selectedValue: string | number | null = null;

  /** Valores seleccionados (selección múltiple) */
  @Input() selectedValues: Array<string | number | null> = [];

  /** Permite selección múltiple de chips */
  @Input() allowMultiple: boolean = false;

  /** Servicio opcional para obtener colores dinámicamente */
  readonly chipConfigService = input<any>();

  /** Label personalizado para el chip "Todos" */
  readonly allLabel = input<string>('Todos');

  /** Emite el valor del chip seleccionado (selección única) */
  readonly chipSelected = output<string | number | null>();

  /** Emite los valores de chips seleccionados (selección múltiple) */
  readonly chipsSelected = output<Array<string | number | null>>();

  /** Estado interno para selección única (sincronizado con input) */
  private internalSelectedValue: string | number | null = null;

  /** Estado interno para selección múltiple (sincronizado con input) */
  private internalSelectedValues: Array<string | number | null> = [];

  constructor(private readonly cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Inicializar estado interno con valores del input
    this.internalSelectedValue = this.selectedValue;
    this.internalSelectedValues = this.selectedValues ? [...this.selectedValues] : [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Sincronizar estado interno cuando cambia el input selectedValue
    if (changes['selectedValue'] && !this.allowMultiple) {
      this.internalSelectedValue = changes['selectedValue'].currentValue;
      this.cdr.markForCheck();
    }

    // Sincronizar estado interno cuando cambia el input selectedValues
    if (changes['selectedValues'] && this.allowMultiple) {
      this.internalSelectedValues = changes['selectedValues'].currentValue
        ? [...changes['selectedValues'].currentValue]
        : [];
      this.cdr.markForCheck();
    }
  }

  /**
   * Maneja el click en un chip
   */
  onChipClick(index: number): void {
    const chip = this.chips[index];

    if (chip.disabled) {
      return;
    }

    if (this.allowMultiple) {
      this.handleMultipleSelection(index);
    } else {
      this.handleSingleSelection(index);
    }
  }

  /**
   * Maneja la selección única
   */
  private handleSingleSelection(index: number): void {
    const chip = this.chips[index];
    // No actualizar el estado interno, solo emitir el evento
    // El padre actualizará el formulario y eso actualizará el input
    this.chipSelected.emit(chip.value);
  }

  /**
   * Maneja la selección múltiple
   */
  private handleMultipleSelection(index: number): void {
    const chip = this.chips[index];
    const chipValue = chip.value;

    // Crear una copia del estado actual para calcular el nuevo estado
    let newSelectedValues = [...this.internalSelectedValues];

    // Si se selecciona "Todos" (null), limpiar todas las selecciones y seleccionar solo "Todos"
    if (chipValue === null) {
      newSelectedValues = [null];
      this.chipsSelected.emit(newSelectedValues);
      return;
    }

    // Si "Todos" está seleccionado y se selecciona otro chip, quitar "Todos"
    if (newSelectedValues.includes(null)) {
      newSelectedValues = newSelectedValues.filter((v) => v !== null);
    }

    // Toggle del chip seleccionado
    const chipIndex = newSelectedValues.indexOf(chipValue);
    if (chipIndex > -1) {
      // Si ya está seleccionado, deseleccionarlo
      newSelectedValues = newSelectedValues.filter((v) => v !== chipValue);
    } else {
      // Si no está seleccionado, agregarlo
      newSelectedValues = [...newSelectedValues, chipValue];
    }

    // Si no hay ningún chip seleccionado, seleccionar "Todos" por defecto
    if (newSelectedValues.length === 0 && this.chips[0]?.value === null) {
      newSelectedValues = [null];
    }

    // Emitir el nuevo estado (el padre actualizará el formulario)
    this.chipsSelected.emit(newSelectedValues);
  }

  /**
   * Verifica si un chip está seleccionado
   */
  isChipSelected(index: number): boolean {
    const chip = this.chips[index];

    if (this.allowMultiple) {
      return this.internalSelectedValues.includes(chip.value);
    }

    return this.internalSelectedValue === chip.value;
  }

  /**
   * Obtiene los estilos inline para un chip
   */
  getChipStyles(chip: ChipConfig, index: number): Record<string, string> {
    const isActive = this.isChipSelected(index);

    // Si el chip está deshabilitado
    if (chip.disabled) {
      return {
        'background-color': '#f3f4f6',
        color: '#9ca3af',
        'border-color': 'transparent',
        cursor: 'not-allowed',
        opacity: '0.6',
      };
    }

    // Si hay servicio de configuración, intentar usarlo
    const chipConfigService = this.chipConfigService();
    if (chipConfigService && chip.value !== null) {
      try {
        const config = chipConfigService.getConfig?.(chip.value);
        if (config) {
          return chipConfigService.getChipStyles?.(chip.value, isActive) || this.getDefaultStyles(chip, isActive);
        }
      } catch (error) {
        // Si falla, usar estilos por defecto
      }
    }

    // Usar colores del chip o valores por defecto
    return this.getDefaultStyles(chip, isActive);
  }

  /**
   * Obtiene estilos por defecto para un chip
   */
  private getDefaultStyles(chip: ChipConfig, isActive: boolean): Record<string, string> {
    if (isActive) {
      return {
        'background-color': chip.backgroundColor || '#6b7280',
        color: chip.textColor || '#ffffff',
        'border-color': 'transparent',
      };
    }

    return {
      'background-color': '#f3f4f6',
      color: '#6b7280',
      'border-color': 'transparent',
    };
  }
}

