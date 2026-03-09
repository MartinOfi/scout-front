import { ChangeDetectionStrategy, Component, Input, forwardRef, ChangeDetectorRef, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-datetime-local-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './datetime-local-field.component.html',
  styleUrls: ['./datetime-local-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatetimeLocalFieldComponent),
      multi: true,
    },
  ],
})
export class DatetimeLocalFieldComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  readonly placeholder = input<string>('');
  readonly min = input<string>();
  readonly max = input<string>();
  readonly step = input<number>(1);
  @Input() disabled: boolean = false;
  readonly id = input<string>();

  value: string = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  writeValue(value: string | null): void {
    if (value) {
      this.value = this.normalizeToISO8601(value);
    } else {
      this.value = '';
    }
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
    this.disabled = isDisabled;
  }

  handleInput(value: string): void {
    const normalized = this.normalizeToISO8601(value);
    this.value = normalized;
    this.onChange(normalized);
  }

  handleBlur(): void {
    this.onTouched();
  }

  private normalizeToISO8601(input: string): string {
    if (!input) return '';
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) {
      return input;
    }
    const date = new Date(input);
    if (isNaN(date.getTime())) return input;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
