import { ChangeDetectionStrategy, Component, Input, forwardRef, ChangeDetectorRef, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import {
  applyPhoneMask,
  removePhoneMask,
  type PhoneMaskFormat,
} from './phone-mask.util';
import {
  normalizePhoneToE164,
  denormalizeE164ToNational,
  type NormalizeFormat,
} from './phone-normalizer.util';

@Component({
    selector: 'app-phone-field',
    standalone: true,
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './phone-field.component.html',
    styleUrls: ['./phone-field.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PhoneFieldComponent),
            multi: true,
        },
    ]
})
export class PhoneFieldComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  readonly placeholder = input<string>('');
  @Input() disabled: boolean = false;
  readonly id = input<string>();
  readonly autocomplete = input<string>('tel');
  readonly country = input<string>('AR');
  readonly maskFormat = input<PhoneMaskFormat>('AR');
  readonly normalizeTo = input<NormalizeFormat>('E164');
  readonly autoDetectCountry = input<boolean>(false);

  value: string = '';
  displayValue: string = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  writeValue(value: string | null): void {
    if (!value) {
      this.value = '';
      this.displayValue = '';
      this.cdr.markForCheck();
      return;
    }

    if (this.normalizeTo() === 'E164' && value.startsWith('+')) {
      this.value = value;
      const national = denormalizeE164ToNational(value, this.country());
      const masked = applyPhoneMask(national, this.maskFormat());
      this.displayValue = masked.formatted;
    } else {
      this.value = value;
      const masked = applyPhoneMask(value, this.maskFormat());
      this.displayValue = masked.formatted;
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

  handleInput(raw: string): void {
    const digits = removePhoneMask(raw);
    const masked = applyPhoneMask(digits, this.maskFormat());
    this.displayValue = masked.formatted;

    if (this.normalizeTo() === 'E164') {
      const normalized = normalizePhoneToE164(digits, this.country());
      this.value = normalized.normalized;
      this.onChange(normalized.normalized);
    } else {
      this.value = digits;
      this.onChange(digits);
    }
  }

  handleBlur(): void {
    this.onTouched();
  }
}
