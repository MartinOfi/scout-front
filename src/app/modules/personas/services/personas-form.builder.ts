/**
 * Personas Form Builder
 * Construye FormGroups tipados para crear/editar personas
 * SIN any - tipado estricto
 * Synced with backend API: docs/API_REFERENCE.md
 */

import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  CreateProtagonistaDto,
  CreateEducadorDto,
  CreatePersonaExternaDto,
  UpdatePersonaDto,
  Protagonista,
  Educador,
  PersonaExterna,
} from '../../../shared/models';

import { Rama, CargoEducador } from '../../../shared/enums';
import { safeTextValidator } from '../../../shared/validators/custom-validators';

@Injectable({
  providedIn: 'root',
})
export class PersonasFormBuilder {
  private readonly fb = inject(FormBuilder);

  // ============================================================================
  // Protagonista Forms
  // ============================================================================

  /**
   * Construir formulario para crear un nuevo protagonista
   * Backend accepts: nombre, rama
   */
  buildCreateProtagonistaForm(): FormGroup {
    return this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      rama: ['', [Validators.required]],
    });
  }

  /**
   * Construir formulario para editar un protagonista
   * Backend accepts: nombre, estado, rama
   */
  buildEditProtagonistaForm(protagonista: Protagonista): FormGroup {
    return this.fb.group({
      nombre: [
        protagonista.nombre,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      rama: [protagonista.rama, [Validators.required]],
    });
  }

  /**
   * Extraer DTO del formulario de protagonista
   */
  extractCreateProtagonistaDto(form: FormGroup): CreateProtagonistaDto {
    return {
      nombre: form.value.nombre as string,
      rama: form.value.rama as Rama,
    };
  }

  /**
   * Extraer UpdateDTO del formulario de protagonista
   */
  extractUpdateProtagonistaDto(form: FormGroup): UpdatePersonaDto {
    return {
      nombre: form.value.nombre as string,
      rama: form.value.rama as Rama,
    };
  }

  // ============================================================================
  // Educador Forms
  // ============================================================================

  /**
   * Construir formulario para crear un nuevo educador
   * Backend accepts: nombre, rama (optional), cargo
   */
  buildCreateEducadorForm(): FormGroup {
    return this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      rama: [null],
      cargo: ['', [Validators.required]],
    });
  }

  /**
   * Construir formulario para editar un educador
   * Backend accepts: nombre, estado, rama, cargo
   */
  buildEditEducadorForm(educador: Educador): FormGroup {
    return this.fb.group({
      nombre: [
        educador.nombre,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      rama: [educador.rama],
      cargo: [educador.cargo, [Validators.required]],
    });
  }

  /**
   * Extraer DTO del formulario de educador
   */
  extractCreateEducadorDto(form: FormGroup): CreateEducadorDto {
    return {
      nombre: form.value.nombre as string,
      rama: form.value.rama ?? undefined,
      cargo: form.value.cargo as CargoEducador,
    };
  }

  /**
   * Extraer UpdateDTO del formulario de educador
   */
  extractUpdateEducadorDto(form: FormGroup): UpdatePersonaDto {
    return {
      nombre: form.value.nombre as string,
      rama: form.value.rama ?? undefined,
      cargo: form.value.cargo as CargoEducador,
    };
  }

  // ============================================================================
  // Persona Externa Forms
  // ============================================================================

  /**
   * Construir formulario para crear una nueva persona externa
   * Backend accepts: nombre, contacto, notas
   */
  buildCreatePersonaExternaForm(): FormGroup {
    return this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      contacto: ['', [Validators.maxLength(100)]],
      notas: [''],
    });
  }

  /**
   * Construir formulario para editar una persona externa
   * Backend accepts: nombre, estado, contacto, notas
   */
  buildEditPersonaExternaForm(personaExterna: PersonaExterna): FormGroup {
    return this.fb.group({
      nombre: [
        personaExterna.nombre,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      contacto: [personaExterna.contacto ?? '', [Validators.maxLength(100)]],
      notas: [personaExterna.notas ?? ''],
    });
  }

  /**
   * Extraer DTO del formulario de persona externa
   */
  extractCreatePersonaExternaDto(form: FormGroup): CreatePersonaExternaDto {
    return {
      nombre: form.value.nombre as string,
      contacto: form.value.contacto || undefined,
      notas: form.value.notas || undefined,
    };
  }

  /**
   * Extraer UpdateDTO del formulario de persona externa
   */
  extractUpdatePersonaExternaDto(form: FormGroup): UpdatePersonaDto {
    return {
      nombre: form.value.nombre as string,
      contacto: form.value.contacto || undefined,
      notas: form.value.notas || undefined,
    };
  }

  // ============================================================================
  // Generic Forms
  // ============================================================================

  /**
   * Construir formulario genérico de edición (para estado, etc)
   */
  buildEditGenericForm(): FormGroup {
    return this.fb.group({
      estado: [''],
    });
  }
}
