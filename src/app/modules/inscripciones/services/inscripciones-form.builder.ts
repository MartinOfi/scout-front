/**
 * Inscripciones Form Builder
 * Construye FormGroups tipados para crear/editar inscripciones
 * SIN any - tipado estricto
 */

import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  CreateInscripcionDto,
  UpdateInscripcionDto,
  Inscripcion,
} from '../../../shared/models';

import { TipoInscripcion } from '../../../shared/enums';

import { positiveNumberValidator, decimalValidator } from '../../../shared/validators/custom-validators';

@Injectable({
  providedIn: 'root',
})
export class InscripcionesFormBuilder {
  private readonly fb = inject(FormBuilder);

  // ============================================================================
  // Create Inscripción Form
  // ============================================================================

  /**
   * Construir formulario para crear una nueva inscripción
   */
  buildCreateForm(): FormGroup {
    return this.fb.group({
      personaId: ['', [Validators.required]],
      tipo: ['scout_argentina' as TipoInscripcion, [Validators.required]],
      ano: [new Date().getFullYear(), [Validators.required]],
      montoTotal: [
        '',
        [
          Validators.required,
          positiveNumberValidator(),
          decimalValidator(2),
        ],
      ],
      montoBonificado: [0, [Validators.min(0), decimalValidator(2)]],
      declaracionDeSalud: [false],
      autorizacionDeImagen: [false],
      salidasCercanas: [false],
      autorizacionIngreso: [false],
    });
  }

  /**
   * Construir formulario para editar una inscripción
   * Solo permite editar bonificación y autorizaciones
   */
  buildEditForm(inscripcion: Inscripcion): FormGroup {
    return this.fb.group({
      montoBonificado: [
        inscripcion.montoBonificado,
        [Validators.min(0), decimalValidator(2)],
      ],
      declaracionDeSalud: [inscripcion.declaracionDeSalud],
      autorizacionDeImagen: [inscripcion.autorizacionDeImagen],
      salidasCercanas: [inscripcion.salidasCercanas],
      autorizacionIngreso: [inscripcion.autorizacionIngreso],
    });
  }

  /**
   * Extraer DTO del formulario de crear inscripción
   */
  extractCreateDto(form: FormGroup): CreateInscripcionDto {
    const value = form.value;
    const dto: CreateInscripcionDto = {
      personaId: value.personaId as string,
      tipo: value.tipo as TipoInscripcion,
      ano: value.ano as number,
      montoTotal: Number(value.montoTotal),
    };

    // Only include optional fields if they have non-default values
    if (value.montoBonificado > 0) {
      dto.montoBonificado = Number(value.montoBonificado);
    }
    if (value.declaracionDeSalud) {
      dto.declaracionDeSalud = true;
    }
    if (value.autorizacionDeImagen) {
      dto.autorizacionDeImagen = true;
    }
    if (value.salidasCercanas) {
      dto.salidasCercanas = true;
    }
    if (value.autorizacionIngreso) {
      dto.autorizacionIngreso = true;
    }

    return dto;
  }

  /**
   * Extraer UpdateDTO del formulario de editar inscripción
   */
  extractUpdateDto(form: FormGroup): UpdateInscripcionDto {
    const value = form.value;
    return {
      montoBonificado: Number(value.montoBonificado),
      declaracionDeSalud: value.declaracionDeSalud as boolean,
      autorizacionDeImagen: value.autorizacionDeImagen as boolean,
      salidasCercanas: value.salidasCercanas as boolean,
      autorizacionIngreso: value.autorizacionIngreso as boolean,
    };
  }
}
