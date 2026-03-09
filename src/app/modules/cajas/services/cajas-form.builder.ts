/**
 * Cajas Form Builder
 * Construye FormGroups tipados para operaciones con cajas
 * SIN any - tipado estricto
 */

import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CreateCajaDto } from '../../../shared/models';
import { CajaType } from '../../../shared/enums';
import { positiveNumberValidator, decimalValidator } from '../../../shared/validators/custom-validators';

@Injectable({
  providedIn: 'root',
})
export class CajasFormBuilder {
  private readonly fb = inject(FormBuilder);

  // ============================================================================
  // Asignación de Fondo Form
  // ============================================================================

  /**
   * Construir formulario para asignar fondo a una rama
   */
  buildAsignacionFondoForm(): FormGroup {
    return this.fb.group({
      rama: ['', [Validators.required]],
      monto: [
        '',
        [
          Validators.required,
          positiveNumberValidator(),
          decimalValidator(2),
        ],
      ],
      descripcion: ['', [Validators.maxLength(500)]],
    });
  }

  /**
   * Extraer DTO del formulario de asignación de fondo
   */
  extractAsignacionDto(form: FormGroup): {
    rama: string;
    monto: number;
    descripcion?: string;
  } {
    return {
      rama: form.value.rama as string,
      monto: Number(form.value.monto) as number,
      descripcion: form.value.descripcion || undefined,
    };
  }

  // ============================================================================
  // Create Caja Form (admin only)
  // ============================================================================

  /**
   * Construir formulario para crear una nueva caja
   */
  buildCreateForm(): FormGroup {
    return this.fb.group({
      tipo: ['', [Validators.required]],
      nombre: ['', [Validators.maxLength(100)]],
      propietarioId: [null],
    });
  }

  /**
   * Extraer DTO del formulario de crear caja
   */
  extractCreateDto(form: FormGroup): CreateCajaDto {
    return {
      tipo: form.value.tipo as CajaType,
      nombre: form.value.nombre || undefined,
      propietarioId: form.value.propietarioId || undefined,
    };
  }
}
