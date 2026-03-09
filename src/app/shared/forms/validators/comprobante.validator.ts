/**
 * Comprobante Validator
 * Valida estado de comprobante para egresos
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator for comprobante state
 * If comprobante is required, it should be marked as delivered
 */
export function comprobanteValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const requiereComprobante = group.get('requiereComprobante')?.value;
    const comprobanteEntregado = group.get('comprobanteEntregado')?.value;
    
    if (requiereComprobante && !comprobanteEntregado) {
      return { 
        comprobantePendiente: { 
          message: 'El comprobante es requerido pero no ha sido entregado'
        } 
      };
    }
    
    return null;
  };
}
