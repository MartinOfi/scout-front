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
  RegistrarIngresoEventoDto,
  RegistrarGastoEventoDto,
  Evento,
} from '../../../shared/models';
import { TipoEvento, DestinoGanancia } from '../../../shared/enums';
import { MedioPagoEnum, EstadoPago } from '../../../shared/enums/movimiento.enum';

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
      descripcion: ['', [Validators.maxLength(500), safeTextValidator()]],
      destinoGanancia: [DEFAULT_DESTINO_GANANCIA],
      tipoEvento: ['', [Validators.maxLength(50), safeTextValidator()]],
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
      descripcion: [evento.descripcion ?? '', [Validators.maxLength(500), safeTextValidator()]],
      destinoGanancia: [evento.destinoGanancia ?? DestinoGanancia.CAJA_GRUPO],
      tipoEvento: [evento.tipoEvento ?? '', [Validators.maxLength(50), safeTextValidator()]],
    });
  }

  /**
   * Construir formulario para crear un producto
   */
  buildProductoForm(producto?: {
    nombre: string;
    precioVenta: number;
    precioCosto: number;
  }): FormGroup {
    return this.fb.group({
      nombre: [
        producto?.nombre ?? '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          safeTextValidator(),
        ],
      ],
      precioVenta: [
        producto?.precioVenta ?? '',
        [Validators.required, positiveNumberValidator(), decimalValidator(2)],
      ],
      precioCosto: [
        producto?.precioCosto ?? '',
        [Validators.required, positiveNumberValidator(), decimalValidator(2)],
      ],
    });
  }

  buildIngresoForm(): FormGroup {
    return this.fb.group({
      monto: ['', [Validators.required, positiveNumberValidator(), decimalValidator(2)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500), safeTextValidator()]],
      responsableId: ['', [Validators.required]],
      medioPago: ['', [Validators.required]],
    });
  }

  buildGastoForm(): FormGroup {
    return this.fb.group({
      monto: ['', [Validators.required, positiveNumberValidator(), decimalValidator(2)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500), safeTextValidator()]],
      responsableId: ['', [Validators.required]],
      medioPago: ['', [Validators.required]],
      estadoPago: ['', [Validators.required]],
      personaAReembolsarId: [''],
    });
  }

  /**
   * Extraer DTO del formulario de crear evento
   */
  extractCreateDto(form: FormGroup): CreateEventoDto {
    const tipo = form.value.tipo as TipoEvento;
    return {
      nombre: form.value.nombre as string,
      tipo,
      fecha: form.value.fecha as string,
      descripcion: form.value.descripcion || undefined,
      destinoGanancia:
        tipo === TipoEvento.VENTA ? form.value.destinoGanancia || undefined : undefined,
      tipoEvento: tipo === TipoEvento.GRUPO ? form.value.tipoEvento || undefined : undefined,
    };
  }

  extractUpdateDto(form: FormGroup): UpdateEventoDto {
    const tipo = form.value.tipo as TipoEvento;
    return {
      nombre: form.value.nombre as string,
      tipo,
      fecha: form.value.fecha as string,
      descripcion: form.value.descripcion || undefined,
      destinoGanancia:
        tipo === TipoEvento.VENTA ? form.value.destinoGanancia || undefined : undefined,
      tipoEvento: tipo === TipoEvento.GRUPO ? form.value.tipoEvento || undefined : undefined,
    };
  }

  extractProductoDto(form: FormGroup): CreateProductoDto {
    return {
      nombre: form.value.nombre as string,
      precioVenta: Number(form.value.precioVenta),
      precioCosto: Number(form.value.precioCosto),
    };
  }

  extractVentaDto(form: FormGroup): CreateVentaProductoDto {
    return {
      productoId: form.value.productoId as string,
      vendedorId: form.value.vendedorId as string,
      cantidad: Number(form.value.cantidad),
    };
  }

  extractIngresoDto(form: FormGroup): RegistrarIngresoEventoDto {
    return {
      monto: Number(form.value.monto),
      descripcion: form.value.descripcion as string,
      responsableId: form.value.responsableId as string,
      medioPago: form.value.medioPago as MedioPagoEnum,
    };
  }

  extractGastoDto(form: FormGroup): RegistrarGastoEventoDto {
    return {
      monto: Number(form.value.monto),
      descripcion: form.value.descripcion as string,
      responsableId: form.value.responsableId as string,
      medioPago: form.value.medioPago as MedioPagoEnum,
      estadoPago: form.value.estadoPago as EstadoPago,
      personaAReembolsarId: form.value.personaAReembolsarId || undefined,
    };
  }
}
