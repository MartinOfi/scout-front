/**
 * Personas Form Builder
 * Construye FormGroups tipados para crear/editar personas
 * SIN any - tipado estricto
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

import { Rama } from '../../../shared/enums';
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
      apellido: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      dni: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{7,8}$/),
        ],
      ],
      fechaIngreso: ['', [Validators.required]],
      rama: ['', [Validators.required]],
    });
  }

  /**
   * Construir formulario para editar un protagonista
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
      apellido: [
        protagonista.apellido,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      dni: [
        protagonista.dni,
        [
          Validators.required,
          Validators.pattern(/^\d{7,8}$/),
        ],
      ],
      fechaIngreso: [protagonista.fechaIngreso, [Validators.required]],
      rama: [protagonista.rama, [Validators.required]],
    });
  }

  /**
   * Extraer DTO del formulario de protagonista
   */
  extractCreateProtagonistaDto(form: FormGroup): CreateProtagonistaDto {
    return {
      nombre: form.value.nombre as string,
      apellido: form.value.apellido as string,
      dni: form.value.dni as string,
      fechaIngreso: form.value.fechaIngreso as string,
      rama: form.value.rama as Rama,
    };
  }

  /**
   * Extraer UpdateDTO del formulario de protagonista
   */
  extractUpdateProtagonistaDto(form: FormGroup): UpdatePersonaDto {
    return {
      nombre: form.value.nombre as string,
      apellido: form.value.apellido as string,
      dni: form.value.dni as string,
      rama: form.value.rama as Rama,
    };
  }

  // ============================================================================
  // Educador Forms
  // ============================================================================

  /**
   * Construir formulario para crear un nuevo educador
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
      apellido: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      dni: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{7,8}$/),
        ],
      ],
      fechaIngreso: ['', [Validators.required]],
      rama: [null],
      cargo: ['', [Validators.maxLength(100)]],
    });
  }

  /**
   * Construir formulario para editar un educador
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
      apellido: [
        educador.apellido,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      dni: [
        educador.dni,
        [
          Validators.required,
          Validators.pattern(/^\d{7,8}$/),
        ],
      ],
      fechaIngreso: [educador.fechaIngreso, [Validators.required]],
      rama: [educador.rama],
      cargo: [educador.cargo ?? '', [Validators.maxLength(100)]],
    });
  }

  /**
   * Extraer DTO del formulario de educador
   */
  extractCreateEducadorDto(form: FormGroup): CreateEducadorDto {
    return {
      nombre: form.value.nombre as string,
      apellido: form.value.apellido as string,
      dni: form.value.dni as string,
      fechaIngreso: form.value.fechaIngreso as string,
      rama: form.value.rama ?? undefined,
      cargo: form.value.cargo || undefined,
    };
  }

  /**
   * Extraer UpdateDTO del formulario de educador
   */
  extractUpdateEducadorDto(form: FormGroup): UpdatePersonaDto {
    return {
      nombre: form.value.nombre as string,
      apellido: form.value.apellido as string,
      dni: form.value.dni as string,
      rama: form.value.rama ?? undefined,
      cargo: form.value.cargo || undefined,
    };
  }

  // ============================================================================
  // Persona Externa Forms
  // ============================================================================

  /**
   * Construir formulario para crear una nueva persona externa
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
      apellido: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      dni: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{7,8}$/),
        ],
      ],
      relacion: ['', [Validators.maxLength(100)]],
    });
  }

  /**
   * Construir formulario para editar una persona externa
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
      apellido: [
        personaExterna.apellido,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      dni: [
        personaExterna.dni,
        [
          Validators.required,
          Validators.pattern(/^\d{7,8}$/),
        ],
      ],
      relacion: [personaExterna.relacion ?? '', [Validators.maxLength(100)]],
    });
  }

  /**
   * Extraer DTO del formulario de persona externa
   */
  extractCreatePersonaExternaDto(form: FormGroup): CreatePersonaExternaDto {
    return {
      nombre: form.value.nombre as string,
      apellido: form.value.apellido as string,
      dni: form.value.dni as string,
      relacion: form.value.relacion || undefined,
    };
  }

  /**
   * Extraer UpdateDTO del formulario de persona externa
   */
  extractUpdatePersonaExternaDto(form: FormGroup): UpdatePersonaDto {
    return {
      nombre: form.value.nombre as string,
      apellido: form.value.apellido as string,
      dni: form.value.dni as string,
      relacion: form.value.relacion || undefined,
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
