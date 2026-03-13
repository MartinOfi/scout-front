import { Component, ChangeDetectionStrategy, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, ReactiveFormsModule, NgControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

/**
 * Email Input Component
 * Reusable email input with icon prefix, validation, and error display
 *
 * Uses NgControl injection pattern - no NG_VALUE_ACCESSOR provider needed
 * as valueAccessor is set manually in constructor to avoid circular dependency
 */
@Component({
  selector: 'app-email-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './email-input.component.html',
  styleUrl: './email-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailInputComponent implements ControlValueAccessor {
  readonly placeholder = input<string>('tu@email.com');
  readonly label = input<string>('Correo electrónico');
  readonly required = input<boolean>(false);
  readonly icon = input<string>('email');
  readonly errorMessages = input<Record<string, string>>({
    required: 'El correo es requerido',
    email: 'Ingresa un correo válido',
  });

  readonly disabled = signal(false);
  readonly value = signal('');
  readonly touched = signal(false);
  readonly focused = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // Injected NgControl for accessing form control errors
  private ngControl = inject(NgControl, { optional: true, self: true });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get control(): FormControl | null {
    return this.ngControl?.control as FormControl | null;
  }

  get hasError(): boolean {
    return !!this.control?.invalid && this.touched();
  }

  get currentError(): string | null {
    if (!this.control || !this.hasError) return null;
    const errors = this.control.errors;
    if (!errors) return null;

    const errorKeys = Object.keys(errors);
    const errorMessages = this.errorMessages();
    for (const key of errorKeys) {
      if (errorMessages[key]) {
        return errorMessages[key];
      }
    }
    return null;
  }

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  onFocus(): void {
    this.focused.set(true);
  }

  onBlur(): void {
    this.focused.set(false);
    if (!this.touched()) {
      this.touched.set(true);
      this.onTouched();
    }
  }
}
