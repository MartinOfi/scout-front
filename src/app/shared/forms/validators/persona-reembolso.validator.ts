/**
 * Persona a reembolsar requerida
 *
 * Un movimiento pendiente de reembolso es una deuda del grupo con alguien,
 * así que tiene que decir con quién. Sin persona, el back lo rechaza (y antes
 * quedaba invisible en el dashboard y el reporte de reembolsos).
 */

import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import { pairwise, startWith } from 'rxjs';
import { EstadoPago } from '../../enums';

const ESTADO_CONTROL = 'estadoPago';
const RESPONSABLE_CONTROL = 'responsableId';
const PERSONA_CONTROL = 'personaAReembolsarId';

/**
 * Mientras `estadoPago` sea PENDIENTE_REEMBOLSO:
 *  - `personaAReembolsarId` es obligatorio,
 *  - se precarga con el responsable (normalmente quien adelantó la plata),
 *  - sigue al responsable si este cambia, salvo que se haya elegido otra persona.
 * Al salir de ese estado se limpia. Aplica también al valor inicial.
 */
export function syncPersonaAReembolsarRequerida(form: FormGroup, destroyRef: DestroyRef): void {
  const estadoCtrl = form.get(ESTADO_CONTROL);
  const personaCtrl = form.get(PERSONA_CONTROL);
  if (!estadoCtrl || !personaCtrl) return;

  const responsableCtrl = form.get(RESPONSABLE_CONTROL);
  const esPendiente = (): boolean => estadoCtrl.value === EstadoPago.PENDIENTE_REEMBOLSO;

  estadoCtrl.valueChanges
    .pipe(startWith(estadoCtrl.value), takeUntilDestroyed(destroyRef))
    .subscribe(() =>
      aplicarEstado(personaCtrl, {
        pendiente: esPendiente(),
        responsableId: responsableCtrl?.value ?? null,
      }),
    );

  responsableCtrl?.valueChanges
    .pipe(startWith(responsableCtrl.value), pairwise(), takeUntilDestroyed(destroyRef))
    .subscribe(([anterior, actual]) => {
      const sigueAlResponsable = !personaCtrl.value || personaCtrl.value === anterior;
      if (esPendiente() && sigueAlResponsable) {
        personaCtrl.setValue(actual ?? null);
      }
    });
}

interface EstadoReembolso {
  pendiente: boolean;
  responsableId: string | null;
}

function aplicarEstado(
  personaCtrl: AbstractControl,
  { pendiente, responsableId }: EstadoReembolso,
): void {
  if (pendiente) {
    personaCtrl.setValidators([Validators.required]);
    if (!personaCtrl.value) {
      personaCtrl.setValue(responsableId, { emitEvent: false });
    }
  } else {
    personaCtrl.clearValidators();
    personaCtrl.setValue(null, { emitEvent: false });
  }
  personaCtrl.updateValueAndValidity();
}
