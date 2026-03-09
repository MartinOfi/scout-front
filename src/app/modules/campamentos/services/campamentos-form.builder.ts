/**
 * Campamentos Form Builder
 * Construye FormGroups tipados para crear/editar campamentos
 * SIN any - tipado estricto
 */

import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  CreateCampamentoDto,
  UpdateCampamentoDto,
  AddParticipanteDto,
  RegistrarPagoCampamentoDto,
  RegistrarGastoCampamentoDto,
  Campamento,
} from '../../../shared/models';

import { MedioPago, EstadoPago } from '../../../shared/enums';

import {
  positiveNumberValidator,
  decimalValidator,
  safeTextValidator,
  dateRangeValidator,
} from '../../../shared/validators/custom-validators';

@Injectable({
  providedIn: 'root',
})
export class CampamentosFormBuilder {
  private readonly fb = inject(FormBuilder);

  // ============================================================================
  // Create Campamento Form
  // ============================================================================

  /**
   * Construir formulario para crear un nuevo campamento
   */
  buildCreateForm(): FormGroup {
    const form = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]],
      costoPorPersona: [
        '',
        [
          Validators.required,
          positiveNumberValidator(),
          decimalValidator(2),
        ],
      ],
      descripcion: [
        '',
        [
          Validators.maxLength(500),
          safeTextValidator(),
        ],
      ],
    }, { validators: dateRangeValidator('fechaInicio', 'fechaFin') });

    return form;
  }

  /**
   * Construir formulario para editar un campamento
   */
  buildEditForm(campamento: Campamento): FormGroup {
    return this.fb.group({
      nombre: [
        campamento.nombre,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      fechaInicio: [campamento.fechaInicio],
      fechaFin: [campamento.fechaFin],
      costoPorPersona: [
        campamento.costoPorPersona,
        [
          Validators.required,
          positiveNumberValidator(),
          decimalValidator(2),
        ],
      ],
      descripcion: [
        campamento.descripcion ?? '',
        [
          Validators.maxLength(500),
          safeTextValidator(),
        ],
      ],
    }, { validators: dateRangeValidator('fechaInicio', 'fechaFin') });
  }

  /**
   * Construir formulario para agregar participante
   */
  buildParticipanteForm(): FormGroup {
    return this.fb.group({
      personaId: ['', [Validators.required]],
      cuotaPersonalizada: ['', [decimalValidator(2)]],
    });
  }

  /**
   * Construir formulario para registrar pago
   */
  buildPagoForm(): FormGroup {
    return this.fb.group({
      personaId: ['', [Validators.required]],
      monto: [
        '',
        [
          Validators.required,
          positiveNumberValidator(),
          decimalValidator(2),
        ],
      ],
      medioPago: ['', [Validators.required]],
    });
  }

  /**
   * Construir formulario para registrar gasto
   */
  buildGastoForm(): FormGroup {
    return this.fb.group({
      monto: [
        '',
        [
          Validators.required,
          positiveNumberValidator(),
          decimalValidator(2),
        ],
      ],
      descripcion: [
        '',
        [
          Validators.required,
          Validators.maxLength(500),
          safeTextValidator(),
        ],
      ],
      responsableId: ['', [Validators.required]],
      medioPago: ['', [Validators.required]],
      estadoPago: ['', [Validators.required]],
    });
  }

  /**
   * Extraer DTO del formulario de crear campamento
   */
  extractCreateDto(form: FormGroup): CreateCampamentoDto {
    return {
      nombre: form.value.nombre as string,
      fechaInicio: form.value.fechaInicio as string,
      fechaFin: form.value.fechaFin as string,
      costoPorPersona: Number(form.value.costoPorPersona) as number,
      descripcion: form.value.descripcion || undefined,
    };
  }

  /**
   * Extraer UpdateDTO del formulario de editar campamento
   */
  extractUpdateDto(form: FormGroup): UpdateCampamentoDto {
    return {
      nombre: form.value.nombre as string,
      fechaInicio: form.value.fechaInicio as string,
      fechaFin: form.value.fechaFin as string,
      costoPorPersona: Number(form.value.costoPorPersona) as number,
      descripcion: form.value.descripcion || undefined,
    };
  }

  /**
   * Extraer DTO del formulario de participante
   */
  extractParticipanteDto(form: FormGroup): AddParticipanteDto {
    return {
      personaId: form.value.personaId as string,
    };
  }

  /**
   * Extraer DTO del formulario de pago
   */
  extractPagoDto(form: FormGroup): RegistrarPagoCampamentoDto {
    return {
      personaId: form.value.personaId as string,
      monto: Number(form.value.monto) as number,
      medioPago: form.value.medioPago as MedioPago,
    };
  }

  /**
   * Extraer DTO del formulario de gasto
   */
  extractGastoDto(form: FormGroup): RegistrarGastoCampamentoDto {
    return {
      monto: Number(form.value.monto) as number,
      descripcion: form.value.descripcion as string,
      responsableId: form.value.responsableId as string,
      medioPago: form.value.medioPago as MedioPago,
      estadoPago: form.value.estadoPago as EstadoPago,
    };
  }
}
