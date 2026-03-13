import { Component, ChangeDetectionStrategy, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, ReactiveFormsModule, NgControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * Password Input Component
 * Reusable password input with icon prefix, visibility toggle, and error display
 *
 * Uses NgControl injection pattern - no NG_VALUE_ACCESSOR provider needed
 * as valueAccessor is set manually in constructor to avoid circular dependency
 */
@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  templateUrl: './password-input.component.html',
  styleUrl: './password-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordInputComponent implements ControlValueAccessor {
  readonly placeholder = input<string>('••••••••');
  readonly label = input<string>('Contraseña');
  readonly required = input<boolean>(false);
  readonly icon = input<string>('lock');
  readonly showToggle = input<boolean>(true);
  readonly errorMessages = input<Record<string, string>>({
    required: 'La contraseña es requerida',
    minlength: 'Mínimo 6 caracteres',
  });

  readonly disabled = signal(false);
  readonly value = signal('');
  readonly touched = signal(false);
  readonly focused = signal(false);
  readonly hidePassword = signal(true);

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

  get inputType(): string {
    return this.hidePassword() ? 'password' : 'text';
  }

  get visibilityIcon(): string {
    return this.hidePassword() ? 'visibility_off' : 'visibility';
  }

  get visibilityLabel(): string {
    return this.hidePassword() ? 'Mostrar contraseña' : 'Ocultar contraseña';
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

  toggleVisibility(): void {
    this.hidePassword.update((v) => !v);
  }
}
