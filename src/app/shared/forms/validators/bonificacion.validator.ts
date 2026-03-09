/**
 * Bonificación Validator
 * Valida si el protagonista puede aplicar bonificación (RN2)
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Protagonista } from '../../models';

/**
 * Validator for bonificación availability
 * Checks if protagonista has already used their bonificación
 */
export function bonificacionValidator(
  getProtagonista: () => Protagonista | null
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const aplicarBonificacion = control.value;
    if (!aplicarBonificacion) return null;
    
    const protagonista = getProtagonista();
    if (protagonista && protagonista.fueBonificado) {
      return { 
        bonificacionNoDisponible: { 
          message: 'Este protagonista ya utilizó su bonificación' 
        } 
      };
    }
    
    return null;
  };
}
