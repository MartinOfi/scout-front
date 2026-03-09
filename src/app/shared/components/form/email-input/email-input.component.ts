import {
  Component,
  Input,
  forwardRef,
  ChangeDetectionStrategy,
  input
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Email Input Component
 * Componente reutilizable para input de email con validación HTML5
 */
@Component({
    selector: 'app-email-input',
    templateUrl: './email-input.component.html',
    styleUrls: ['./email-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EmailInputComponent),
            multi: true,
        },
    ]
})
export class EmailInputComponent implements ControlValueAccessor {
  readonly placeholder = input<string>('Ingresa tu correo electrónico');
  readonly label = input<string>('Correo electrónico');
  readonly required = input<boolean>(false);
  @Input() disabled: boolean = false;

  value: string = '';
  touched: boolean = false;

  onChange = (value: string) => {};
  onTouched = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
  }
}
