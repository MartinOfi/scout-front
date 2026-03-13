import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
  ChangeDetectorRef,
  inject,
  input,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-date-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateFieldComponent),
      multi: true,
    },
  ],
})
export class DateFieldComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  readonly placeholder = input<string>('');
  readonly min = input<string>();
  readonly max = input<string>();
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

  /**
   * Normalizes date input to ISO 8601 format (YYYY-MM-DD)
   *
   * For "date-only" ISO strings (e.g., "2026-03-13T00:00:00.000Z"),
   * extracts the date part directly to avoid timezone offset issues.
   */
  private normalizeToISO8601(input: string): string {
    if (!input) return '';

    // Already in correct format
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      return input;
    }

    // Handle ISO strings: extract YYYY-MM-DD directly to avoid timezone issues
    // Matches: "2026-03-13T00:00:00.000Z", "2026-03-13T15:30:00Z", etc.
    const isoMatch = input.match(/^(\d{4}-\d{2}-\d{2})T/);
    if (isoMatch) {
      return isoMatch[1];
    }

    // Fallback: parse as Date (for other formats)
    const date = new Date(input);
    if (isNaN(date.getTime())) return input;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
