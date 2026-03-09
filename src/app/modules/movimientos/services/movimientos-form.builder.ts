/**
 * Movimientos Form Builder
 * Construye FormGroups tipados para crear/editar movimientos
 * SIN any - tipado estricto
 */

import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  CreateMovimientoDto,
  UpdateMovimientoDto,
  Movimiento,
} from '../../../shared/models';

import {
  TipoMovimientoEnum,
  ConceptoMovimiento,
  MedioPagoEnum,
  EstadoPago,
} from '../../../shared/enums';

import {
  positiveNumberValidator,
  decimalValidator,
  safeTextValidator,
} from '../../../shared/validators/custom-validators';

@Injectable({
  providedIn: 'root',
})
export class MovimientosFormBuilder {
  private readonly fb = inject(FormBuilder);

  // ============================================================================
  // Create Movimiento Form
  // ============================================================================

  /**
   * Construir formulario para crear un nuevo movimiento
   */
  buildCreateForm(): FormGroup {
    return this.fb.group({
      cajaId: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      monto: [
        '',
        [
          Validators.required,
          positiveNumberValidator(),
          decimalValidator(2),
        ],
      ],
      concepto: ['', [Validators.required]],
      descripcion: [
        '',
        [
          Validators.maxLength(500),
          safeTextValidator(),
        ],
      ],
      responsableId: ['', [Validators.required]],
      medioPago: ['', [Validators.required]],
      requiereComprobante: [false],
      estadoPago: ['', [Validators.required]],
      personaAReembolsarId: [null],
      fecha: [new Date().toISOString().split('T')[0]],
      eventoId: [null],
      campamentoId: [null],
      inscripcionId: [null],
      cuotaId: [null],
    });
  }

  /**
   * Construir formulario para editar un movimiento
   */
  buildEditForm(movimiento: Movimiento): FormGroup {
    return this.fb.group({
      descripcion: [
        movimiento.descripcion ?? '',
        [
          Validators.maxLength(500),
          safeTextValidator(),
        ],
      ],
      comprobanteEntregado: [movimiento.comprobanteEntregado ?? false],
      estadoPago: [movimiento.estadoPago, [Validators.required]],
    });
  }

  /**
   * Extraer DTO del formulario de crear movimiento
   */
  extractCreateDto(form: FormGroup): CreateMovimientoDto {
    const { fecha, ...rest } = form.value;

    return {
      ...rest,
      cajaId: rest.cajaId as string,
      tipo: rest.tipo as TipoMovimientoEnum,
      monto: Number(rest.monto) as number,
      concepto: rest.concepto as ConceptoMovimiento,
      descripcion: rest.descripcion || undefined,
      responsableId: rest.responsableId as string,
      medioPago: rest.medioPago as MedioPagoEnum,
      requiereComprobante: rest.requiereComprobante as boolean,
      estadoPago: rest.estadoPago as EstadoPago,
      personaAReembolsarId: rest.personaAReembolsarId || undefined,
      fecha: fecha || undefined,
      eventoId: rest.eventoId || undefined,
      campamentoId: rest.campamentoId || undefined,
      inscripcionId: rest.inscripcionId || undefined,
      cuotaId: rest.cuotaId || undefined,
    };
  }

  /**
   * Extraer UpdateDTO del formulario de editar movimiento
   */
  extractUpdateDto(form: FormGroup): UpdateMovimientoDto {
    return {
      descripcion: form.value.descripcion || undefined,
      comprobanteEntregado: form.value.comprobanteEntregado as boolean,
      estadoPago: form.value.estadoPago as EstadoPago,
    };
  }

  // ============================================================================
  // Filtered Create Form (for specific use cases)
  // ============================================================================

  /**
   * Formulario simplificado para registrar gasto general
   */
  buildGastoGeneralForm(): FormGroup {
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
   * Extraer DTO del formulario de gasto general
   */
  extractGastoGeneralDto(form: FormGroup): {
    monto: number;
    descripcion: string;
    responsableId: string;
    medioPago: string;
    estadoPago: string;
  } {
    return {
      monto: Number(form.value.monto) as number,
      descripcion: form.value.descripcion as string,
      responsableId: form.value.responsableId as string,
      medioPago: form.value.medioPago as string,
      estadoPago: form.value.estadoPago as string,
    };
  }

  // ============================================================================
  // Ingreso/Egreso Forms (for events)
  // ============================================================================

  /**
   * Formulario para registrar ingreso en evento
   */
  buildIngresoForm(): FormGroup {
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
    });
  }

  /**
   * Formulario para registrar egreso en evento
   */
  buildEgresoForm(): FormGroup {
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
   * Extraer DTO del formulario de ingreso
   */
  extractIngresoDto(form: FormGroup): {
    monto: number;
    descripcion: string;
  } {
    return {
      monto: Number(form.value.monto) as number,
      descripcion: form.value.descripcion as string,
    };
  }

  /**
   * Extraer DTO del formulario de egreso
   */
  extractEgresoDto(form: FormGroup): {
    monto: number;
    descripcion: string;
    responsableId: string;
    medioPago: string;
    estadoPago: string;
  } {
    return {
      monto: Number(form.value.monto) as number,
      descripcion: form.value.descripcion as string,
      responsableId: form.value.responsableId as string,
      medioPago: form.value.medioPago as string,
      estadoPago: form.value.estadoPago as string,
    };
  }
}
