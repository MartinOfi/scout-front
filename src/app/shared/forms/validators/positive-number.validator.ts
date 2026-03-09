/**
 * Positive Number Validator
 * Valida que el número sea positivo (> 0)
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator for positive numbers
 */
export function positiveNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') return null;
    
    const num = Number(value);
    if (isNaN(num)) return { notANumber: { value } };
    if (num <= 0) return { notPositive: { value } };
    
    return null;
  };
}
