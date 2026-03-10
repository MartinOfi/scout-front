/**
 * Bonificación Validator
 * Validates inscription bonification based on inscription history
 *
 * Note: fueBonificado field was removed from Protagonista entity.
 * Bonification is now tracked via EstadoInscripcion.BONIFICADO state.
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Inscripcion } from '../../models';
import { EstadoInscripcion } from '../../enums';

/**
 * Validator for bonificación availability
 * Checks if persona has any bonified inscription in current year
 */
export function bonificacionValidator(
  getInscripciones: () => Inscripcion[],
  ano: number
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const aplicarBonificacion = control.value;
    if (!aplicarBonificacion) return null;

    const inscripciones = getInscripciones();
    const hasBonificadoThisYear = inscripciones.some(
      (i) => i.ano === ano && i.estado === 'bonificado'
    );

    if (hasBonificadoThisYear) {
      return {
        bonificacionNoDisponible: {
          message: 'Ya existe una inscripción bonificada para este año',
        },
      };
    }

    return null;
  };
}
