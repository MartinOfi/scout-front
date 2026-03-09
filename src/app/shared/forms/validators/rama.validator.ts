/**
 * Rama Validator
 * Valida que el valor sea una rama válida
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RAMAS, Rama } from '../../enums';

/**
 * Validator for Rama enum
 */
export function ramaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    return RAMAS.includes(control.value as Rama) 
      ? null 
      : { ramaInvalida: { value: control.value } };
  };
}
