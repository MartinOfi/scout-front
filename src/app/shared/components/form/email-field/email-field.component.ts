import { ChangeDetectionStrategy, Component, Input, forwardRef, ChangeDetectorRef, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-email-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './email-field.component.html',
  styleUrls: ['./email-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmailFieldComponent),
      multi: true,
    },
  ],
})
export class EmailFieldComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  readonly placeholder = input<string>('');
  @Input() disabled: boolean = false;
  readonly id = input<string>();
  readonly autocomplete = input<string>('email');

  value: string = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  writeValue(value: string | null): void {
    this.value = value ?? '';
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
    this.value = value;
    this.onChange(value);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
