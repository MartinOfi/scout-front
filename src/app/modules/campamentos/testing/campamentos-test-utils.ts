/**
 * Campamentos Test Utilities
 * Provides typed mock factories for Campamentos module testing
 */

import { FormBuilder, FormGroup } from '@angular/forms';
import { signal, WritableSignal } from '@angular/core';
import { of, Observable } from 'rxjs';
import { Campamento, ParticipanteCampamento, CreateCampamentoDto, UpdateCampamentoDto } from '../../../shared/models';

/**
 * Create mock Campamento
 */
export function createMockCampamento(overrides: Partial<Campamento> = {}): Campamento {
  return {
    id: 'camp-1',
    nombre: 'Campamento Test',
    fechaInicio: new Date('2024-07-01'),
    fechaFin: new Date('2024-07-07'),
    ubicacion: 'Sierra de Córdoba',
    descripcion: 'Campamento de prueba',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create mock ParticipanteCampamento
 */
export function createMockParticipanteCampamento(
  overrides: Partial<ParticipanteCampamento> = {}
): ParticipanteCampamento {
  return {
    id: 'part-1',
    campamentoId: 'camp-1',
    personaId: 'pers-1',
    cuotaPersonal: 500,
    cuotaGrupo: 200,
    totalPagado: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Typed Mock CampamentosStateService
 */
export interface MockCampamentosStateService {
  campamentos: WritableSignal<Campamento[]>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  selected: WritableSignal<Campamento | null>;
  load: jasmine.Spy<Observable<void>>;
  create: jasmine.Spy<Observable<Campamento>>;
  update: jasmine.Spy<Observable<Campamento>>;
  delete: jasmine.Spy<Observable<void>>;
  select: jasmine.Spy<void>;
}

/**
 * Create mock CampamentosStateService
 */
export function createMockCampamentosStateService(): MockCampamentosStateService {
  return {
    campamentos: signal<Campamento[]>([]),
    loading: signal<boolean>(false),
    error: signal<string | null>(null),
    selected: signal<Campamento | null>(null),
    load: jasmine.createSpy().and.returnValue(of(undefined)),
    create: jasmine.createSpy().and.returnValue(of(createMockCampamento())),
    update: jasmine.createSpy().and.returnValue(of(createMockCampamento())),
    delete: jasmine.createSpy().and.returnValue(of(undefined)),
    select: jasmine.createSpy(),
  };
}

/**
 * Typed Mock CampamentosFormBuilder
 */
export interface MockCampamentosFormBuilder {
  buildCreateForm: () => FormGroup;
  buildEditForm: (c: Campamento) => FormGroup;
  extractCreateDto: (form: FormGroup) => CreateCampamentoDto;
  extractUpdateDto: (form: FormGroup) => UpdateCampamentoDto;
}

/**
 * Create mock CampamentosFormBuilder
 */
export function createMockCampamentosFormBuilder(): MockCampamentosFormBuilder {
  const fb = new FormBuilder();

  return {
    buildCreateForm: (): FormGroup =>
      fb.group({
        nombre: [''],
        fechaInicio: [''],
        fechaFin: [''],
        ubicacion: [''],
        descripcion: [''],
      }),
    buildEditForm: (c: Campamento): FormGroup =>
      fb.group({
        nombre: [c.nombre],
        fechaInicio: [c.fechaInicio],
        fechaFin: [c.fechaFin],
        ubicacion: [c.ubicacion],
        descripcion: [c.descripcion],
      }),
    extractCreateDto: (form: FormGroup): CreateCampamentoDto =>
      form.value as CreateCampamentoDto,
    extractUpdateDto: (form: FormGroup): UpdateCampamentoDto =>
      form.value as UpdateCampamentoDto,
  };
}
