/**
 * Personas Testing Utilities
 * Reusable test fixtures, mocks, and factories for Personas module
 * Used by all Smart component tests following TDD patterns
 */

import { signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { of } from 'rxjs';

import { Protagonista, Educador, PersonaExterna } from '../../../shared/models';
import { PersonaType, EstadoPersona, RamaEnum } from '../../../shared/enums';

// ============================================================================
// Mock Data Factories
// ============================================================================

export const createMockProtagonista = (overrides: Partial<Protagonista> = {}): Protagonista => ({
  id: '1',
  nombre: 'Juan',
  apellido: 'Pérez',
  dni: '12345678',
  tipo: PersonaType.PROTAGONISTA,
  estado: EstadoPersona.ACTIVO,
  fechaIngreso: new Date('2024-01-01'),
  rama: RamaEnum.MANADA,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: undefined,
  cuentaPersonalId: 'cuenta-1',
  ...overrides,
});

export const createMockEducador = (overrides: Partial<Educador> = {}): Educador => ({
  id: '2',
  nombre: 'María',
  apellido: 'González',
  dni: '87654321',
  tipo: PersonaType.EDUCADOR,
  estado: EstadoPersona.ACTIVO,
  fechaIngreso: new Date('2024-01-01'),
  rama: RamaEnum.UNIDAD,
  cargo: 'Coordinadora',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: undefined,
  cuentaPersonalId: 'cuenta-2',
  ...overrides,
});

export const createMockPersonaExterna = (overrides: Partial<PersonaExterna> = {}): PersonaExterna => ({
  id: '3',
  nombre: 'Carlos',
  apellido: 'López',
  dni: '11223344',
  tipo: PersonaType.EXTERNA,
  estado: EstadoPersona.ACTIVO,
  relacion: 'Padre',
  contacto: '123456789',
  notas: 'Contacto principal',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: undefined,
  cuentaPersonalId: 'cuenta-3',
  ...overrides,
});

// ============================================================================
// Mock State Service Factories
// ============================================================================

export const createMockPersonasStateService = () => ({
  protagonistas: signal<Protagonista[]>([]),
  educadores: signal<Educador[]>([]),
  personasExternas: signal<PersonaExterna[]>([]),
  loading: signal<boolean>(false),
  error: signal<string | null>(null),
  selected: signal<any>(null),
  load: jasmine.createSpy().and.returnValue(of(undefined)),
  createProtagonista: jasmine.createSpy().and.returnValue(of(createMockProtagonista())),
  createEducador: jasmine.createSpy().and.returnValue(of(createMockEducador())),
  createPersonaExterna: jasmine.createSpy().and.returnValue(of(createMockPersonaExterna())),
  update: jasmine.createSpy().and.returnValue(of(createMockProtagonista())),
  delete: jasmine.createSpy().and.returnValue(of(undefined)),
  select: jasmine.createSpy(),
  clear: jasmine.createSpy(),
});

export const createMockEducadoresStateService = () => ({
  educadores: signal<Educador[]>([]),
  loading: signal<boolean>(false),
  error: signal<string | null>(null),
  selected: signal<Educador | null>(null),
  load: jasmine.createSpy().and.returnValue(of(undefined)),
  create: jasmine.createSpy().and.returnValue(of(createMockEducador())),
  update: jasmine.createSpy().and.returnValue(of(createMockEducador())),
  delete: jasmine.createSpy().and.returnValue(of(undefined)),
  select: jasmine.createSpy(),
  clear: jasmine.createSpy(),
});

export const createMockPersonasExternasStateService = () => ({
  personasExternas: signal<PersonaExterna[]>([]),
  loading: signal<boolean>(false),
  error: signal<string | null>(null),
  selected: signal<PersonaExterna | null>(null),
  load: jasmine.createSpy().and.returnValue(of(undefined)),
  create: jasmine.createSpy().and.returnValue(of(createMockPersonaExterna())),
  update: jasmine.createSpy().and.returnValue(of(createMockPersonaExterna())),
  delete: jasmine.createSpy().and.returnValue(of(undefined)),
  select: jasmine.createSpy(),
  clear: jasmine.createSpy(),
});

// ============================================================================
// Mock Router & ActivatedRoute
// ============================================================================

export const createMockRouter = () => ({
  navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
  navigateByUrl: jasmine.createSpy('navigateByUrl').and.returnValue(Promise.resolve(true)),
});

export const createMockActivatedRoute = (params: any = {}) => ({
  params: of(params),
  snapshot: {
    params,
    queryParams: {},
  },
});

// ============================================================================
// Mock Dialog & Form Builder Services
// ============================================================================

export const createMockConfirmDialogService = () => ({
  confirmDelete: jasmine.createSpy().and.returnValue(of(true)),
  confirm: jasmine.createSpy().and.returnValue(of(true)),
});

/**
 * Typed Mock PersonasFormBuilder
 */
export interface MockPersonasFormBuilder {
  buildCreateProtagonistaForm: () => FormGroup;
  buildEditProtagonistaForm: (p: Protagonista) => FormGroup;
  buildCreateEducadorForm: () => FormGroup;
  buildEditEducadorForm: (e: Educador) => FormGroup;
  buildCreatePersonaExternaForm: () => FormGroup;
  buildEditPersonaExternaForm: (pe: PersonaExterna) => FormGroup;
  extractCreateProtagonistaDto: (form: FormGroup) => CreateProtagonistaDto;
  extractUpdateProtagonistaDto: (form: FormGroup) => UpdateProtagonistaDto;
  extractCreateEducadorDto: (form: FormGroup) => CreateEducadorDto;
  extractUpdateEducadorDto: (form: FormGroup) => UpdateEducadorDto;
  extractCreatePersonaExternaDto: (form: FormGroup) => CreatePersonaExternaDto;
  extractUpdatePersonaExternaDto: (form: FormGroup) => UpdatePersonaExternaDto;
}

export const createMockPersonasFormBuilder = (): MockPersonasFormBuilder => {
  const fb = new FormBuilder();
  return {
    buildCreateProtagonistaForm: (): FormGroup =>
      fb.group({
        nombre: [''],
        apellido: [''],
        dni: [''],
        fechaIngreso: [''],
        rama: [''],
      }),
    buildEditProtagonistaForm: (p: Protagonista): FormGroup =>
      fb.group({
        nombre: [p.nombre],
        apellido: [p.apellido],
        dni: [p.dni],
        fechaIngreso: [p.fechaIngreso],
        rama: [p.rama],
      }),
    buildCreateEducadorForm: (): FormGroup =>
      fb.group({
        nombre: [''],
        apellido: [''],
        dni: [''],
        fechaIngreso: [''],
        rama: [null],
        cargo: [''],
      }),
    buildEditEducadorForm: (e: Educador): FormGroup =>
      fb.group({
        nombre: [e.nombre],
        apellido: [e.apellido],
        dni: [e.dni],
        fechaIngreso: [e.fechaIngreso],
        rama: [e.rama],
        cargo: [e.cargo],
      }),
    buildCreatePersonaExternaForm: (): FormGroup =>
      fb.group({
        nombre: [''],
        apellido: [''],
        dni: [''],
        relacion: [''],
      }),
    buildEditPersonaExternaForm: (pe: PersonaExterna): FormGroup =>
      fb.group({
        nombre: [pe.nombre],
        apellido: [pe.apellido],
        dni: [pe.dni],
        relacion: [pe.relacion],
      }),
    extractCreateProtagonistaDto: (form: FormGroup): CreateProtagonistaDto =>
      form.value as CreateProtagonistaDto,
    extractUpdateProtagonistaDto: (form: FormGroup): UpdateProtagonistaDto =>
      form.value as UpdateProtagonistaDto,
    extractCreateEducadorDto: (form: FormGroup): CreateEducadorDto =>
      form.value as CreateEducadorDto,
    extractUpdateEducadorDto: (form: FormGroup): UpdateEducadorDto =>
      form.value as UpdateEducadorDto,
    extractCreatePersonaExternaDto: (
      form: FormGroup
    ): CreatePersonaExternaDto =>
      form.value as CreatePersonaExternaDto,
    extractUpdatePersonaExternaDto: (
      form: FormGroup
    ): UpdatePersonaExternaDto =>
      form.value as UpdatePersonaExternaDto,
  };
};
