import { DestroyRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EstadoPago } from '../../enums';
import { syncPersonaAReembolsarRequerida } from './persona-reembolso.validator';

describe('syncPersonaAReembolsarRequerida', () => {
  const fakeDestroyRef = { onDestroy: () => () => undefined } as unknown as DestroyRef;

  function buildForm(estado: EstadoPago, persona: string | null = null): FormGroup {
    return new FormGroup({
      estadoPago: new FormControl(estado),
      personaAReembolsarId: new FormControl(persona),
    });
  }

  it('vuelve inválido el form si pasa a pendiente_reembolso sin persona', () => {
    const form = buildForm(EstadoPago.PAGADO);
    syncPersonaAReembolsarRequerida(form, fakeDestroyRef);

    form.patchValue({ estadoPago: EstadoPago.PENDIENTE_REEMBOLSO });

    expect(form.get('personaAReembolsarId')?.hasError('required')).toBe(true);
    expect(form.valid).toBe(false);
  });

  it('aplica la regla al estado inicial (edición de un pendiente sin persona)', () => {
    const form = buildForm(EstadoPago.PENDIENTE_REEMBOLSO);
    syncPersonaAReembolsarRequerida(form, fakeDestroyRef);

    expect(form.valid).toBe(false);
  });

  it('es válido con persona cargada', () => {
    const form = buildForm(EstadoPago.PENDIENTE_REEMBOLSO, 'persona-1');
    syncPersonaAReembolsarRequerida(form, fakeDestroyRef);

    expect(form.valid).toBe(true);
  });

  it('limpia la persona y el requerido al volver a pagado', () => {
    const form = buildForm(EstadoPago.PENDIENTE_REEMBOLSO, 'persona-1');
    syncPersonaAReembolsarRequerida(form, fakeDestroyRef);

    form.patchValue({ estadoPago: EstadoPago.PAGADO });

    expect(form.get('personaAReembolsarId')?.value).toBeNull();
    expect(form.valid).toBe(true);
  });

  describe('default al responsable', () => {
    function buildFormConResponsable(responsable: string | null): FormGroup {
      return new FormGroup({
        estadoPago: new FormControl(EstadoPago.PAGADO),
        responsableId: new FormControl(responsable),
        personaAReembolsarId: new FormControl<string | null>(null),
      });
    }

    it('precarga el responsable al pasar a pendiente_reembolso', () => {
      const form = buildFormConResponsable('resp-1');
      syncPersonaAReembolsarRequerida(form, fakeDestroyRef);

      form.patchValue({ estadoPago: EstadoPago.PENDIENTE_REEMBOLSO });

      expect(form.get('personaAReembolsarId')?.value).toBe('resp-1');
      expect(form.valid).toBe(true);
    });

    it('sigue al responsable si cambia y la persona no fue tocada', () => {
      const form = buildFormConResponsable('resp-1');
      syncPersonaAReembolsarRequerida(form, fakeDestroyRef);
      form.patchValue({ estadoPago: EstadoPago.PENDIENTE_REEMBOLSO });

      form.patchValue({ responsableId: 'resp-2' });

      expect(form.get('personaAReembolsarId')?.value).toBe('resp-2');
    });

    it('respeta la persona elegida a mano aunque cambie el responsable', () => {
      const form = buildFormConResponsable('resp-1');
      syncPersonaAReembolsarRequerida(form, fakeDestroyRef);
      form.patchValue({ estadoPago: EstadoPago.PENDIENTE_REEMBOLSO });
      form.patchValue({ personaAReembolsarId: 'otra-persona' });

      form.patchValue({ responsableId: 'resp-2' });

      expect(form.get('personaAReembolsarId')?.value).toBe('otra-persona');
    });

    it('precarga cuando el responsable se elige después del estado', () => {
      const form = buildFormConResponsable(null);
      syncPersonaAReembolsarRequerida(form, fakeDestroyRef);
      form.patchValue({ estadoPago: EstadoPago.PENDIENTE_REEMBOLSO });

      form.patchValue({ responsableId: 'resp-1' });

      expect(form.get('personaAReembolsarId')?.value).toBe('resp-1');
    });
  });
});
