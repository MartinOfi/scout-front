/**
 * Componente selector múltiple de días
 *
 * Basado en las especificaciones del todo.md líneas 68, 91
 * Selector múltiple de días
 */

import {
  Component,
  Input,
  forwardRef,
  output
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DayOfWeek } from '../../../../shared/enums/day-of-week.enum';
import {
  getAllDaysInOrder,
  getDayNameInSpanish,
} from '../../../../shared/utils/time-helpers';

@Component({
  selector: 'app-days-selector',
  templateUrl: './days-selector.component.html',
  styleUrls: ['./days-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DaysSelectorComponent),
      multi: true,
    },
  ]
})
export class DaysSelectorComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() errorMessage: string = '';

  readonly daysChange = output<DayOfWeek[]>();

  value: DayOfWeek[] = [];
  isDisabled: boolean = false;

  /** Todos los días de la semana en orden */
  allDays = getAllDaysInOrder();

  private onChange = (value: DayOfWeek[]) => { };
  private onTouched = () => { };

  writeValue(value: DayOfWeek[]): void {
    this.value = value || [];
  }

  registerOnChange(fn: (value: DayOfWeek[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  /**
   * Obtiene el nombre del día en español
   */
  getDayName(day: DayOfWeek): string {
    return getDayNameInSpanish(day);
  }

  /**
   * Verifica si un día está seleccionado
   */
  isDaySelected(day: DayOfWeek): boolean {
    return this.value.includes(day);
  }

  /**
   * Alterna la selección de un día
   */
  toggleDay(day: DayOfWeek): void {
    if (this.disabled || this.isDisabled) return;

    const index = this.value.indexOf(day);
    if (index > -1) {
      this.value = this.value.filter((d) => d !== day);
    } else {
      this.value = [...this.value, day];
    }

    this.onChange(this.value);
    this.onTouched();
    this.daysChange.emit(this.value);
  }

  /**
   * Selecciona todos los días
   */
  selectAllDays(): void {
    if (this.disabled || this.isDisabled) return;

    this.value = [...this.allDays];
    this.onChange(this.value);
    this.onTouched();
    this.daysChange.emit(this.value);
  }

  /**
   * Deselecciona todos los días
   */
  clearAllDays(): void {
    if (this.disabled || this.isDisabled) return;

    this.value = [];
    this.onChange(this.value);
    this.onTouched();
    this.daysChange.emit(this.value);
  }
}

