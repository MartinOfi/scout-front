/**
 * Fecha Campamento Validator
 * Valida que la fecha de fin sea posterior a la de inicio
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator for campamento dates
 * Checks that end date is after start date
 */
export function fechaCampamentoValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const fechaInicio = group.get('fechaInicio')?.value;
    const fechaFin = group.get('fechaFin')?.value;
    
    if (!fechaInicio || !fechaFin) return null;
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (fin <= inicio) {
      return { 
        fechasInvalidas: { 
          message: 'La fecha de fin debe ser posterior a la fecha de inicio'
        } 
      };
    }
    
    return null;
  };
}
