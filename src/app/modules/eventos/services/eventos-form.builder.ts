/**
 * Eventos Form Builder
 * Construye FormGroups tipados para crear/editar eventos
 * SIN any - tipado estricto
 */

import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  CreateEventoDto,
  UpdateEventoDto,
  CreateProductoDto,
  CreateVentaProductoDto,
  Evento,
} from '../../../shared/models';
import { TipoEvento, DestinoGanancia } from '../../../shared/enums';

import {
  positiveNumberValidator,
  decimalValidator,
  safeTextValidator,
} from '../../../shared/validators/custom-validators';

/**
 * Default destination for event earnings
 */
const DEFAULT_DESTINO_GANANCIA = DestinoGanancia.CAJA_GRUPO;

@Injectable({
  providedIn: 'root',
})
export class EventosFormBuilder {
  private readonly fb = inject(FormBuilder);

  // ============================================================================
  // Create Evento Form
  // ============================================================================

  /**
   * Construir formulario para crear un nuevo evento
   */
  buildCreateForm(): FormGroup {
    return this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      tipo: ['', [Validators.required]],
      fecha: ['', [Validators.required]],
      descripcion: [
        '',
        [
          Validators.maxLength(500),
          safeTextValidator(),
        ],
      ],
      destinoGanancia: [DEFAULT_DESTINO_GANANCIA],
    });
  }

  /**
   * Construir formulario para editar un evento
   */
  buildEditForm(evento: Evento): FormGroup {
    return this.fb.group({
      nombre: [
        evento.nombre,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      tipo: [evento.tipo],
      fecha: [evento.fecha],
      descripcion: [
        evento.descripcion ?? '',
        [
          Validators.maxLength(500),
          safeTextValidator(),
        ],
      ],
      destinoGanancia: [evento.destinoGanancia ?? DestinoGanancia.CAJA_GRUPO],
    });
  }

  /**
   * Construir formulario para crear un producto
   */
  buildProductoForm(): FormGroup {
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
      precioUnitario: [
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
    });
  }

  /**
   * Construir formulario para registrar una venta
   */
  buildVentaForm(): FormGroup {
    return this.fb.group({
      productoId: ['', [Validators.required]],
      cantidad: ['', [Validators.required, positiveNumberValidator()]],
      precioUnitario: [
        '',
        [
          Validators.required,
          positiveNumberValidator(),
          decimalValidator(2),
        ],
      ],
      responsableId: ['', [Validators.required]],
    });
  }

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
   * Extraer DTO del formulario de crear evento
   */
  extractCreateDto(form: FormGroup): CreateEventoDto {
    return {
      nombre: form.value.nombre as string,
      tipo: form.value.tipo as TipoEvento,
      fecha: form.value.fecha as string,
      descripcion: form.value.descripcion || undefined,
      destinoGanancia: form.value.destinoGanancia || undefined,
    };
  }

  /**
   * Extraer UpdateDTO del formulario de editar evento
   */
  extractUpdateDto(form: FormGroup): UpdateEventoDto {
    return {
      nombre: form.value.nombre as string,
      fecha: form.value.fecha as string,
      descripcion: form.value.descripcion || undefined,
      destinoGanancia: form.value.destinoGanancia || undefined,
    };
  }

  /**
   * Extraer DTO del formulario de producto
   */
  extractProductoDto(form: FormGroup): CreateProductoDto {
    return {
      nombre: form.value.nombre as string,
      precioVenta: Number(form.value.precioVenta) as number,
      precioCosto: Number(form.value.precioCosto) as number,
    };
  }

  /**
   * Extraer DTO del formulario de venta
   */
  extractVentaDto(form: FormGroup): CreateVentaProductoDto {
    return {
      productoId: form.value.productoId as string,
      personaId: form.value.personaId as string,
      cantidad: Number(form.value.cantidad) as number,
    };
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
