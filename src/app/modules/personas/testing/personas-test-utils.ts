/**
 * Personas Testing Utilities
 * Reusable test fixtures, mocks, and factories for Personas module
 * Used by all Smart component tests following TDD patterns
 * Synced with backend API: docs/API_REFERENCE.md
 */

import { signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { of } from 'rxjs';

import {
  Protagonista,
  Educador,
  PersonaExterna,
  CreateProtagonistaDto,
  CreateEducadorDto,
  CreatePersonaExternaDto,
  UpdatePersonaDto,
} from '../../../shared/models';
import { PersonaType, EstadoPersona, RamaEnum, CargoEducador } from '../../../shared/enums';

// ============================================================================
// Mock Data Factories - Aligned with backend API
// ============================================================================

export const createMockProtagonista = (
  overrides: Partial<Protagonista> = {}
): Protagonista => ({
  id: '1',
  nombre: 'Juan Pérez',
  tipo: PersonaType.PROTAGONISTA,
  estado: EstadoPersona.ACTIVO,
  rama: RamaEnum.MANADA,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
  ...overrides,
});

export const createMockEducador = (overrides: Partial<Educador> = {}): Educador => ({
  id: '2',
  nombre: 'María González',
  tipo: PersonaType.EDUCADOR,
  estado: EstadoPersona.ACTIVO,
  rama: RamaEnum.UNIDAD,
  cargo: CargoEducador.EDUCADOR,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
  ...overrides,
});

export const createMockPersonaExterna = (
  overrides: Partial<PersonaExterna> = {}
): PersonaExterna => ({
  id: '3',
  nombre: 'Carlos López',
  tipo: PersonaType.EXTERNA,
  estado: EstadoPersona.ACTIVO,
  contacto: '123456789',
  notas: 'Contacto principal',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
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
  selected: signal<Protagonista | Educador | PersonaExterna | null>(null),
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

export const createMockActivatedRoute = (params: Record<string, string> = {}) => ({
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
 * Typed Mock PersonasFormBuilder - Aligned with backend DTOs
 */
export interface MockPersonasFormBuilder {
  buildCreateProtagonistaForm: () => FormGroup;
  buildEditProtagonistaForm: (p: Protagonista) => FormGroup;
  buildCreateEducadorForm: () => FormGroup;
  buildEditEducadorForm: (e: Educador) => FormGroup;
  buildCreatePersonaExternaForm: () => FormGroup;
  buildEditPersonaExternaForm: (pe: PersonaExterna) => FormGroup;
  extractCreateProtagonistaDto: (form: FormGroup) => CreateProtagonistaDto;
  extractUpdateProtagonistaDto: (form: FormGroup) => UpdatePersonaDto;
  extractCreateEducadorDto: (form: FormGroup) => CreateEducadorDto;
  extractUpdateEducadorDto: (form: FormGroup) => UpdatePersonaDto;
  extractCreatePersonaExternaDto: (form: FormGroup) => CreatePersonaExternaDto;
  extractUpdatePersonaExternaDto: (form: FormGroup) => UpdatePersonaDto;
}

export const createMockPersonasFormBuilder = (): MockPersonasFormBuilder => {
  const fb = new FormBuilder();
  return {
    buildCreateProtagonistaForm: (): FormGroup =>
      fb.group({
        nombre: [''],
        rama: [''],
      }),
    buildEditProtagonistaForm: (p: Protagonista): FormGroup =>
      fb.group({
        nombre: [p.nombre],
        rama: [p.rama],
      }),
    buildCreateEducadorForm: (): FormGroup =>
      fb.group({
        nombre: [''],
        rama: [null],
        cargo: [''],
      }),
    buildEditEducadorForm: (e: Educador): FormGroup =>
      fb.group({
        nombre: [e.nombre],
        rama: [e.rama],
        cargo: [e.cargo],
      }),
    buildCreatePersonaExternaForm: (): FormGroup =>
      fb.group({
        nombre: [''],
        contacto: [''],
        notas: [''],
      }),
    buildEditPersonaExternaForm: (pe: PersonaExterna): FormGroup =>
      fb.group({
        nombre: [pe.nombre],
        contacto: [pe.contacto],
        notas: [pe.notas],
      }),
    extractCreateProtagonistaDto: (form: FormGroup): CreateProtagonistaDto => ({
      nombre: form.value.nombre,
      rama: form.value.rama,
    }),
    extractUpdateProtagonistaDto: (form: FormGroup): UpdatePersonaDto => ({
      nombre: form.value.nombre,
      rama: form.value.rama,
    }),
    extractCreateEducadorDto: (form: FormGroup): CreateEducadorDto => ({
      nombre: form.value.nombre,
      rama: form.value.rama ?? undefined,
      cargo: form.value.cargo,
    }),
    extractUpdateEducadorDto: (form: FormGroup): UpdatePersonaDto => ({
      nombre: form.value.nombre,
      rama: form.value.rama ?? undefined,
      cargo: form.value.cargo,
    }),
    extractCreatePersonaExternaDto: (form: FormGroup): CreatePersonaExternaDto => ({
      nombre: form.value.nombre,
      contacto: form.value.contacto || undefined,
      notas: form.value.notas || undefined,
    }),
    extractUpdatePersonaExternaDto: (form: FormGroup): UpdatePersonaDto => ({
      nombre: form.value.nombre,
      contacto: form.value.contacto || undefined,
      notas: form.value.notas || undefined,
    }),
  };
};
