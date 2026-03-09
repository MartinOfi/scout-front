/**
 * Eventos Test Utilities
 * Provides typed mock factories for Eventos module testing
 */

import { FormBuilder, FormGroup } from '@angular/forms';
import { signal, WritableSignal } from '@angular/core';
import { of, Observable } from 'rxjs';
import { Evento, Producto, CreateEventoDto, UpdateEventoDto } from '../../../shared/models';

/**
 * Create mock Evento
 */
export function createMockEvento(overrides: Partial<Evento> = {}): Evento {
  return {
    id: 'evt-1',
    nombre: 'Evento Test',
    fecha: new Date('2024-06-15'),
    descripcion: 'Evento de prueba',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create mock Producto
 */
export function createMockProducto(overrides: Partial<Producto> = {}): Producto {
  return {
    id: 'prod-1',
    nombre: 'Producto Test',
    precio: 100,
    cantidad: 10,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Typed Mock EventosStateService - Vitest compatible
 */
export interface MockEventosStateService {
  eventos: WritableSignal<Evento[]>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  selected: WritableSignal<Evento | null>;
  load: () => Observable<void>;
  create: (dto: CreateEventoDto) => Observable<Evento>;
  update: (id: string, dto: UpdateEventoDto) => Observable<Evento>;
  delete: (id: string) => Observable<void>;
  select: (id: string | null) => void;
}

/**
 * Create mock EventosStateService - Vitest compatible
 */
export function createMockEventosStateService(): MockEventosStateService {
  return {
    eventos: signal<Evento[]>([]),
    loading: signal<boolean>(false),
    error: signal<string | null>(null),
    selected: signal<Evento | null>(null),
    load: () => of(undefined),
    create: () => of(createMockEvento()),
    update: () => of(createMockEvento()),
    delete: () => of(undefined),
    select: () => {},
  };
}

/**
 * Typed Mock EventosFormBuilder
 */
export interface MockEventosFormBuilder {
  buildCreateForm: () => FormGroup;
  buildEditForm: (e: Evento) => FormGroup;
  extractCreateDto: (form: FormGroup) => CreateEventoDto;
  extractUpdateDto: (form: FormGroup) => UpdateEventoDto;
}

/**
 * Create mock EventosFormBuilder
 */
export function createMockEventosFormBuilder(): MockEventosFormBuilder {
  const fb = new FormBuilder();

  return {
    buildCreateForm: (): FormGroup =>
      fb.group({
        nombre: [''],
        fecha: [''],
        descripcion: [''],
      }),
    buildEditForm: (e: Evento): FormGroup =>
      fb.group({
        nombre: [e.nombre],
        fecha: [e.fecha],
        descripcion: [e.descripcion],
      }),
    extractCreateDto: (form: FormGroup): CreateEventoDto =>
      form.value as CreateEventoDto,
    extractUpdateDto: (form: FormGroup): UpdateEventoDto =>
      form.value as UpdateEventoDto,
  };
}
