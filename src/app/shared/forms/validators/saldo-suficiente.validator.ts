/**
 * Saldo Suficiente Validator
 * Valida que el monto no exceda el saldo disponible
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator for sufficient balance
 * Checks if amount doesn't exceed available balance
 */
export function saldoSuficienteValidator(
  getSaldo: () => number
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const monto = Number(control.value);
    if (isNaN(monto) || monto <= 0) return null;
    
    const saldo = getSaldo();
    if (monto > saldo) {
      return { 
        saldoInsuficiente: { 
          saldo,
          monto,
          message: `Saldo insuficiente. Disponible: $${saldo}`
        } 
      };
    }
    
    return null;
  };
}
