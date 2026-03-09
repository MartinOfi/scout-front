/**
 * Componente selector de hora
 *
 * Basado en las especificaciones del todo.md líneas 67, 90
 * Selector de hora
 */

import { Component, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef, inject, output, input } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-time-picker',
    standalone: true,
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './time-picker.component.html',
    styleUrls: ['./time-picker.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TimePickerComponent),
            multi: true,
        },
    ]
})
export class TimePickerComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  @Input() label: string = '';
  readonly placeholder = input<string>('Seleccione una hora');
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() errorMessage: string = '';

  readonly timeChange = output<string>();

  value: string = '';
  isDisabled: boolean = false;

  private onChange: (value: string) => void = () => {
    // Handler será establecido por registerOnChange
  };
  public onTouched: () => void = () => {
    // Handler será establecido por registerOnTouched
  };

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  writeValue(value: string): void {
    this.value = value || '';
    // Forzar detección de cambios con OnPush cuando se recibe valor del FormControl
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onTimeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.onTouched();
    this.timeChange.emit(this.value);
  }
}
