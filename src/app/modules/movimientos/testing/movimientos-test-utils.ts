/**
 * Movimientos Test Utilities
 * Provides typed mock factories for Movimientos module testing
 */

import { FormBuilder, FormGroup } from '@angular/forms';
import { signal, WritableSignal } from '@angular/core';
import { of, Observable } from 'rxjs';
import { Movimiento, CreateMovimientoDto, UpdateMovimientoDto } from '../../../shared/models';
import { ConceptoEnum, TipoMovimientoEnum } from '../../../shared/enums';

/**
 * Create mock Movimiento
 */
export function createMockMovimiento(overrides: Partial<Movimiento> = {}): Movimiento {
  return {
    id: 'mov-1',
    concepto: ConceptoEnum.INGRESO_CUOTA,
    tipo: TipoMovimientoEnum.INGRESO,
    monto: 1000,
    responsable: 'Juan',
    notas: 'Movimiento de prueba',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Typed Mock MovimientosStateService
 */
export interface MockMovimientosStateService {
  movimientos: WritableSignal<Movimiento[]>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  selected: WritableSignal<Movimiento | null>;
  load: jasmine.Spy<Observable<void>>;
  create: jasmine.Spy<Observable<Movimiento>>;
  update: jasmine.Spy<Observable<Movimiento>>;
  delete: jasmine.Spy<Observable<void>>;
  select: jasmine.Spy<void>;
}

/**
 * Create mock MovimientosStateService
 */
export function createMockMovimientosStateService(): MockMovimientosStateService {
  return {
    movimientos: signal<Movimiento[]>([]),
    loading: signal<boolean>(false),
    error: signal<string | null>(null),
    selected: signal<Movimiento | null>(null),
    load: jasmine.createSpy().and.returnValue(of(undefined)),
    create: jasmine.createSpy().and.returnValue(of(createMockMovimiento())),
    update: jasmine.createSpy().and.returnValue(of(createMockMovimiento())),
    delete: jasmine.createSpy().and.returnValue(of(undefined)),
    select: jasmine.createSpy(),
  };
}

/**
 * Typed Mock MovimientosFormBuilder
 */
export interface MockMovimientosFormBuilder {
  buildCreateForm: () => FormGroup;
  buildEditForm: (m: Movimiento) => FormGroup;
  extractCreateDto: (form: FormGroup) => CreateMovimientoDto;
  extractUpdateDto: (form: FormGroup) => UpdateMovimientoDto;
}

/**
 * Create mock MovimientosFormBuilder
 */
export function createMockMovimientosFormBuilder(): MockMovimientosFormBuilder {
  const fb = new FormBuilder();

  return {
    buildCreateForm: (): FormGroup =>
      fb.group({
        concepto: [''],
        tipo: [''],
        monto: [0],
        responsable: [''],
        notas: [''],
      }),
    buildEditForm: (m: Movimiento): FormGroup =>
      fb.group({
        concepto: [m.concepto],
        tipo: [m.tipo],
        monto: [m.monto],
        responsable: [m.responsable],
        notas: [m.notas],
      }),
    extractCreateDto: (form: FormGroup): CreateMovimientoDto =>
      form.value as CreateMovimientoDto,
    extractUpdateDto: (form: FormGroup): UpdateMovimientoDto =>
      form.value as UpdateMovimientoDto,
  };
}
