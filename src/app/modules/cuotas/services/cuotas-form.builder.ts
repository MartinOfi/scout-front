/**
 * Cuotas Form Builder
 * Construye FormGroups tipados para crear/editar cuotas
 * SIN any - tipado estricto
 */

import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  CreateCuotaDto,
  UpdateCuotaDto,
  Cuota,
} from '../../../shared/models';
import { EstadoCuota } from '../../../shared/enums';

import { positiveNumberValidator, decimalValidator } from '../../../shared/validators/custom-validators';

@Injectable({
  providedIn: 'root',
})
export class CuotasFormBuilder {
  private readonly fb = inject(FormBuilder);

  // ============================================================================
  // Create Cuota Form
  // ============================================================================

  /**
   * Construir formulario para crear una nueva cuota
   */
  buildCreateForm(): FormGroup {
    return this.fb.group({
      personaId: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      ano: [new Date().getFullYear(), [Validators.required]],
      montoTotal: [
        '',
        [
          Validators.required,
          positiveNumberValidator(),
          decimalValidator(2),
        ],
      ],
    });
  }

  /**
   * Construir formulario para editar una cuota (actualizar estado o monto pagado)
   */
  buildEditForm(cuota: Cuota): FormGroup {
    return this.fb.group({
      montoPagado: [
        cuota.montoPagado ?? 0,
        [
          Validators.required,
          positiveNumberValidator(),
          decimalValidator(2),
        ],
      ],
      estado: [cuota.estado, [Validators.required]],
    });
  }

  /**
   * Construir formulario para registrar pago de cuota
   */
  buildPagoForm(): FormGroup {
    return this.fb.group({
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
   * Extraer DTO del formulario de crear cuota
   */
  extractCreateDto(form: FormGroup): CreateCuotaDto {
    return {
      personaId: form.value.personaId as string,
      numero: Number(form.value.numero) as number,
      ano: Number(form.value.ano) as number,
      montoTotal: Number(form.value.montoTotal) as number,
    };
  }

  /**
   * Extraer UpdateDTO del formulario de editar cuota
   */
  extractUpdateDto(form: FormGroup): UpdateCuotaDto {
    return {
      montoPagado: form.value.montoPagado ? (Number(form.value.montoPagado) as number) : undefined,
      estado: form.value.estado as EstadoCuota,
    };
  }

  /**
   * Extraer DTO del formulario de pago
   */
  extractPagoDto(form: FormGroup): {
    monto: number;
    medioPago: string;
  } {
    return {
      monto: Number(form.value.monto) as number,
      medioPago: form.value.medioPago as string,
    };
  }
}
