import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, forwardRef, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-number-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './number-field.component.html',
  styleUrls: ['./number-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberFieldComponent),
      multi: true,
    },
  ],
})
export class NumberFieldComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  readonly placeholder = input<string>('');
  readonly min = input<number>();
  readonly max = input<number>();
  readonly step = input<number>(1);
  @Input() disabled: boolean = false;
  readonly id = input<string>();

  value: number | null = null;

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  writeValue(value: number | null): void {
    this.value = value ?? null;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(value: string): void {
    const numValue = value === '' ? null : Number(value);
    this.value = numValue;
    this.onChange(numValue);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
