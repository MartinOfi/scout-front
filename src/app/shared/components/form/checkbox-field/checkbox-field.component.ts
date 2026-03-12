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
  selector: 'app-checkbox-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkbox-field.component.html',
  styleUrls: ['./checkbox-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxFieldComponent),
      multi: true,
    },
  ],
})
export class CheckboxFieldComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  @Input() disabled: boolean = false;
  readonly id = input<string>();

  /** Optional description text shown below the label */
  readonly description = input<string>();

  /** Visual variant: 'default' | 'card' */
  readonly variant = input<'default' | 'card'>('default');

  value: boolean = false;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  writeValue(value: boolean | null): void {
    this.value = value ?? false;
    // Forzar detección de cambios con OnPush cuando se recibe valor del FormControl
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.checked;
    this.onChange(this.value);
    this.onTouched();
  }
}
