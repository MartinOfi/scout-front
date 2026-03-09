/**
 * Inscripciones Test Utilities
 * Provides typed mock factories for Inscripciones module testing
 */

import { FormBuilder, FormGroup } from '@angular/forms';
import { signal, WritableSignal } from '@angular/core';
import { of, Observable } from 'rxjs';
import {
  Inscripcion,
  InscripcionConEstado,
  CreateInscripcionDto,
  UpdateInscripcionDto,
} from '../../../shared/models';

/**
 * Create mock Inscripcion
 */
export function createMockInscripcion(overrides: Partial<Inscripcion> = {}): Inscripcion {
  return {
    id: 'insc-1',
    personaId: 'pers-1',
    tipo: 'scout_argentina',
    ano: 2026,
    montoTotal: 15000,
    montoBonificado: 0,
    declaracionDeSalud: false,
    autorizacionDeImagen: false,
    salidasCercanas: false,
    autorizacionIngreso: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create mock InscripcionConEstado
 */
export function createMockInscripcionConEstado(
  overrides: Partial<Inscripcion> = {},
  montoPagado = 0,
  estado: 'pendiente' | 'parcial' | 'pagado' = 'pendiente'
): InscripcionConEstado {
  return {
    inscripcion: createMockInscripcion(overrides),
    montoPagado,
    estado,
  };
}

/**
 * Typed Mock InscripcionesStateService
 */
export interface MockInscripcionesStateService {
  inscripciones: WritableSignal<Inscripcion[]>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  selected: WritableSignal<Inscripcion | null>;
  selectedDetail: WritableSignal<InscripcionConEstado | null>;
  inscripcionesGrupo: WritableSignal<Inscripcion[]>;
  inscripcionesScoutArgentina: WritableSignal<Inscripcion[]>;
  load: jasmine.Spy<() => void>;
  loadDetail: jasmine.Spy<(id: string) => void>;
  loadByPersona: jasmine.Spy<(personaId: string) => void>;
  create: jasmine.Spy<(dto: CreateInscripcionDto) => Observable<Inscripcion>>;
  update: jasmine.Spy<(id: string, dto: UpdateInscripcionDto) => Observable<Inscripcion>>;
  delete: jasmine.Spy<(id: string) => Observable<void>>;
  select: jasmine.Spy<(id: string | null) => void>;
}

/**
 * Create mock InscripcionesStateService
 */
export function createMockInscripcionesStateService(): MockInscripcionesStateService {
  return {
    inscripciones: signal<Inscripcion[]>([]),
    loading: signal<boolean>(false),
    error: signal<string | null>(null),
    selected: signal<Inscripcion | null>(null),
    selectedDetail: signal<InscripcionConEstado | null>(null),
    inscripcionesGrupo: signal<Inscripcion[]>([]),
    inscripcionesScoutArgentina: signal<Inscripcion[]>([]),
    load: jasmine.createSpy('load'),
    loadDetail: jasmine.createSpy('loadDetail'),
    loadByPersona: jasmine.createSpy('loadByPersona'),
    create: jasmine.createSpy('create').and.returnValue(of(createMockInscripcion())),
    update: jasmine.createSpy('update').and.returnValue(of(createMockInscripcion())),
    delete: jasmine.createSpy('delete').and.returnValue(of(undefined)),
    select: jasmine.createSpy('select'),
  };
}

/**
 * Typed Mock InscripcionesFormBuilder
 */
export interface MockInscripcionesFormBuilder {
  buildCreateForm: () => FormGroup;
  buildEditForm: (i: Inscripcion) => FormGroup;
  extractCreateDto: (form: FormGroup) => CreateInscripcionDto;
  extractUpdateDto: (form: FormGroup) => UpdateInscripcionDto;
}

/**
 * Create mock InscripcionesFormBuilder
 */
export function createMockInscripcionesFormBuilder(): MockInscripcionesFormBuilder {
  const fb = new FormBuilder();

  return {
    buildCreateForm: (): FormGroup =>
      fb.group({
        personaId: [''],
        tipo: ['scout_argentina'],
        ano: [2026],
        montoTotal: [0],
        montoBonificado: [0],
        declaracionDeSalud: [false],
        autorizacionDeImagen: [false],
        salidasCercanas: [false],
        autorizacionIngreso: [false],
      }),
    buildEditForm: (i: Inscripcion): FormGroup =>
      fb.group({
        montoBonificado: [i.montoBonificado],
        declaracionDeSalud: [i.declaracionDeSalud],
        autorizacionDeImagen: [i.autorizacionDeImagen],
        salidasCercanas: [i.salidasCercanas],
        autorizacionIngreso: [i.autorizacionIngreso],
      }),
    extractCreateDto: (form: FormGroup): CreateInscripcionDto =>
      form.value as CreateInscripcionDto,
    extractUpdateDto: (form: FormGroup): UpdateInscripcionDto =>
      form.value as UpdateInscripcionDto,
  };
}
