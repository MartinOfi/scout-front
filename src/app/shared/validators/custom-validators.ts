/**
 * Custom Form Validators
 * Reutilizables en múltiples módulos
 * SIN any - tipado estricto
 */

import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { RAMAS } from '../enums';

/**
 * Valida que el valor sea un número positivo
 * Uso: Validators.required, positiveNumberValidator()
 */
export function positiveNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // let required validator handle empty values
    }

    const value = Number(control.value);
    if (isNaN(value) || value <= 0) {
      return { positiveNumber: { value: control.value } };
    }

    return null;
  };
}

/**
 * Valida que el valor sea un número positivo con máximo de decimales
 * Uso: decimalValidator(2) para máximo 2 decimales
 */
export function decimalValidator(maxDecimals: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = control.value.toString();
    const parts = value.split('.');

    if (parts.length > 2) {
      return { invalidDecimal: { value: control.value } };
    }

    if (parts[1] && parts[1].length > maxDecimals) {
      return {
        maxDecimals: { value: control.value, max: maxDecimals },
      };
    }

    return null;
  };
}

/**
 * Valida que la cadena no contenga caracteres peligrosos
 * Uso: safeTextValidator()
 */
export function safeTextValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    // Caracteres peligrosos: HTML, SQL, XSS
    const dangerousChars = /<|>|"|'|;|&|\||`/g;
    if (dangerousChars.test(control.value)) {
      return { unsafeText: { value: control.value } };
    }

    return null;
  };
}

/**
 * Valida que la rama sea válida del enum
 * Uso: ramaValidator()
 */
export function ramaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const validRamas = Object.values(RAMAS);
    if (!validRamas.includes(control.value)) {
      return { invalidRama: { value: control.value } };
    }

    return null;
  };
}

/**
 * Valida que el rango de fechas sea válido
 * Uso: dateRangeValidator(startControlName, endControlName)
 */
export function dateRangeValidator(
  startFieldName: string,
  endFieldName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof AbstractControl) || !('controls' in control)) {
      return null;
    }

    const formGroup = control as unknown as { controls: Record<string, AbstractControl | undefined> };

    if (!formGroup.controls || !formGroup.controls[startFieldName] || !formGroup.controls[endFieldName]) {
      return null;
    }

    const startValue = formGroup.controls[startFieldName]?.value;
    const endValue = formGroup.controls[endFieldName]?.value;

    if (!startValue || !endValue) {
      return null;
    }

    const startDate = new Date(startValue);
    const endDate = new Date(endValue);

    if (startDate > endDate) {
      return {
        invalidDateRange: {
          start: startValue,
          end: endValue,
        },
      };
    }

    return null;
  };
}

/**
 * Valida que el monto de pago no exceda el monto total
 * Uso: maxMountValidator(totalAmount)
 */
export function maxMountValidator(maxAmount: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = Number(control.value);
    if (value > maxAmount) {
      return {
        maxAmount: { value: control.value, max: maxAmount },
      };
    }

    return null;
  };
}
