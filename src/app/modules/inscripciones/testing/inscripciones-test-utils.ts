/**
 * Inscripciones Test Utilities
 * Provides typed mock factories for Inscripciones module testing
 *
 * Payment Scenarios Covered:
 * 1. PENDIENTE - No payment, full amount pending
 * 2. PARCIAL - Partial payment, some balance remaining
 * 3. PAGADO - Fully paid, zero balance
 * 4. BONIFICADO - Fully bonified, no payment needed
 * 5. MIXTO - Combination of payment + bonification + personal balance
 * 6. CUOTAS - Started at zero, paid in installments
 */

import { FormBuilder, FormGroup } from '@angular/forms';
import { signal, WritableSignal } from '@angular/core';
import { of, Observable } from 'rxjs';
import {
  Inscripcion,
  InscripcionConEstado,
  CreateInscripcionDto,
  UpdateInscripcionDto,
  MovimientoInscripcion,
  PagoInscripcionDto,
  UpdatePagoDto,
  ExistingPago,
} from '../../../shared/models';
import { EstadoInscripcion, MedioPago, TipoInscripcion } from '../../../shared/enums';

// ============================================================================
// BASE MOCK FACTORIES
// ============================================================================

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
 * Create mock MovimientoInscripcion (payment record)
 */
export function createMockMovimiento(
  overrides: Partial<MovimientoInscripcion> = {},
): MovimientoInscripcion {
  return {
    id: 'mov-1',
    monto: 5000,
    medioPago: 'efectivo',
    fecha: '2026-01-15T10:00:00Z',
    descripcion: null,
    ...overrides,
  };
}

/**
 * Create mock InscripcionConEstado (flat structure matching backend)
 */
export function createMockInscripcionConEstado(
  overrides: Partial<Inscripcion> = {},
  montoPagado = 0,
  estado: EstadoInscripcion = 'pendiente',
  movimientos: MovimientoInscripcion[] = [],
): InscripcionConEstado {
  const inscripcion = createMockInscripcion(overrides);
  const saldoPendiente = Math.max(
    0,
    inscripcion.montoTotal - inscripcion.montoBonificado - montoPagado,
  );
  return {
    ...inscripcion,
    montoPagado,
    estado,
    saldoPendiente,
    movimientos,
  };
}

// ============================================================================
// PAYMENT SCENARIO FACTORIES
// ============================================================================

/**
 * Scenario 1: PENDIENTE - No payment received yet
 * Full amount pending, estado = 'pendiente'
 */
export function createPendienteScenario(montoTotal = 15000): InscripcionConEstado {
  return createMockInscripcionConEstado(
    { id: 'insc-pendiente', montoTotal, montoBonificado: 0 },
    0, // montoPagado
    'pendiente',
    [], // no movimientos
  );
}

/**
 * Scenario 2: PARCIAL - Partial payment made
 * Some balance remaining, estado = 'parcial'
 */
export function createParcialScenario(
  montoTotal = 15000,
  montoPagado = 5000,
): InscripcionConEstado {
  return createMockInscripcionConEstado(
    { id: 'insc-parcial', montoTotal, montoBonificado: 0 },
    montoPagado,
    'parcial',
    [createMockMovimiento({ id: 'mov-parcial-1', monto: montoPagado })],
  );
}

/**
 * Scenario 3: PAGADO - Fully paid without personal account
 * Zero balance, estado = 'pagado', paid with efectivo/transferencia
 */
export function createPagadoSinCajaPersonalScenario(montoTotal = 15000): InscripcionConEstado {
  return createMockInscripcionConEstado(
    { id: 'insc-pagado-sin-caja', montoTotal, montoBonificado: 0 },
    montoTotal, // fully paid
    'pagado',
    [createMockMovimiento({ id: 'mov-pagado-1', monto: montoTotal, medioPago: 'transferencia' })],
  );
}

/**
 * Scenario 4: PAGADO - Fully paid with personal account (saldo personal)
 * Zero balance, estado = 'pagado', paid with saldo_personal
 */
export function createPagadoConCajaPersonalScenario(montoTotal = 15000): InscripcionConEstado {
  return createMockInscripcionConEstado(
    { id: 'insc-pagado-con-caja', montoTotal, montoBonificado: 0 },
    montoTotal,
    'pagado',
    [createMockMovimiento({ id: 'mov-caja-1', monto: montoTotal, medioPago: 'saldo_personal' })],
  );
}

/**
 * Scenario 5: BONIFICADO - Fully bonified, no payment needed
 * montoBonificado = montoTotal, estado = 'bonificado'
 */
export function createBonificadoTotalScenario(montoTotal = 15000): InscripcionConEstado {
  return createMockInscripcionConEstado(
    { id: 'insc-bonificado-total', montoTotal, montoBonificado: montoTotal },
    0, // no payment needed
    'bonificado',
    [], // no movimientos
  );
}

/**
 * Scenario 6: BONIFICADO PARCIAL - Partial bonification with remaining paid
 * Part bonified, part paid = PAGADO
 */
export function createBonificadoParcialScenario(
  montoTotal = 15000,
  montoBonificado = 5000,
): InscripcionConEstado {
  const montoRestante = montoTotal - montoBonificado;
  return createMockInscripcionConEstado(
    { id: 'insc-bonificado-parcial', montoTotal, montoBonificado },
    montoRestante, // paid the rest
    'pagado',
    [createMockMovimiento({ id: 'mov-bonif-parcial', monto: montoRestante })],
  );
}

/**
 * Scenario 7: MIXTO - Combination of bonification + payment + personal balance
 * Most complex scenario: partial bonificación, partial efectivo, partial saldo_personal
 */
export function createMixtoScenario(
  montoTotal = 15000,
  montoBonificado = 3000,
  pagoEfectivo = 6000,
  pagoSaldoPersonal = 6000,
): InscripcionConEstado {
  const montoPagado = pagoEfectivo + pagoSaldoPersonal;
  const movimientos: MovimientoInscripcion[] = [];

  if (pagoEfectivo > 0) {
    movimientos.push(
      createMockMovimiento({
        id: 'mov-mixto-efectivo',
        monto: pagoEfectivo,
        medioPago: 'efectivo',
      }),
    );
  }
  if (pagoSaldoPersonal > 0) {
    movimientos.push(
      createMockMovimiento({
        id: 'mov-mixto-saldo',
        monto: pagoSaldoPersonal,
        medioPago: 'saldo_personal',
      }),
    );
  }

  const saldoPendiente = montoTotal - montoBonificado - montoPagado;
  const estado: EstadoInscripcion = saldoPendiente === 0 ? 'pagado' : 'parcial';

  return createMockInscripcionConEstado(
    { id: 'insc-mixto', montoTotal, montoBonificado },
    montoPagado,
    estado,
    movimientos,
  );
}

/**
 * Scenario 8: CUOTAS - Started at zero, paid in multiple installments
 * Multiple movimientos over time
 */
export function createCuotasScenario(
  montoTotal = 15000,
  cuotas: { monto: number; fecha: string; medioPago?: MedioPago }[],
): InscripcionConEstado {
  const movimientos = cuotas.map((cuota, idx) =>
    createMockMovimiento({
      id: `mov-cuota-${idx + 1}`,
      monto: cuota.monto,
      fecha: cuota.fecha,
      medioPago: cuota.medioPago ?? 'efectivo',
    }),
  );

  const montoPagado = cuotas.reduce((sum, c) => sum + c.monto, 0);
  const saldoPendiente = montoTotal - montoPagado;
  const estado: EstadoInscripcion =
    saldoPendiente === 0 ? 'pagado' : saldoPendiente < montoTotal ? 'parcial' : 'pendiente';

  return createMockInscripcionConEstado(
    { id: 'insc-cuotas', montoTotal, montoBonificado: 0 },
    montoPagado,
    estado,
    movimientos,
  );
}

/**
 * Scenario 9: CUOTAS COMPLETAS - Fully paid in 3 installments
 */
export function createCuotasCompletasScenario(): InscripcionConEstado {
  return createCuotasScenario(15000, [
    { monto: 5000, fecha: '2026-01-15T10:00:00Z' },
    { monto: 5000, fecha: '2026-02-15T10:00:00Z' },
    { monto: 5000, fecha: '2026-03-15T10:00:00Z' },
  ]);
}

/**
 * Scenario 10: CUOTAS EN PROGRESO - Partially paid in installments
 */
export function createCuotasEnProgresoScenario(): InscripcionConEstado {
  return createCuotasScenario(15000, [
    { monto: 5000, fecha: '2026-01-15T10:00:00Z' },
    { monto: 3000, fecha: '2026-02-15T10:00:00Z' },
  ]);
}

// ============================================================================
// DTO MOCK FACTORIES
// ============================================================================

/**
 * Create mock PagoInscripcionDto for registering payment
 */
export function createMockPagoDto(overrides: Partial<PagoInscripcionDto> = {}): PagoInscripcionDto {
  return {
    montoPagado: 5000,
    medioPago: 'efectivo',
    ...overrides,
  };
}

/**
 * Create mock UpdatePagoDto for editing payment
 */
export function createMockUpdatePagoDto(overrides: Partial<UpdatePagoDto> = {}): UpdatePagoDto {
  return {
    monto: 6000,
    medioPago: 'transferencia',
    ...overrides,
  };
}

/**
 * Create mock ExistingPago for edit dialog
 */
export function createMockExistingPago(overrides: Partial<ExistingPago> = {}): ExistingPago {
  return {
    movimientoId: 'mov-existing-1',
    monto: 5000,
    medioPago: 'efectivo',
    descripcion: null,
    fecha: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

/**
 * Create mock CreateInscripcionDto
 */
export function createMockCreateDto(
  overrides: Partial<CreateInscripcionDto> = {},
): CreateInscripcionDto {
  return {
    personaId: 'pers-1',
    tipo: 'scout_argentina',
    ano: 2026,
    montoTotal: 15000,
    ...overrides,
  };
}

/**
 * Create mock UpdateInscripcionDto
 */
export function createMockUpdateDto(
  overrides: Partial<UpdateInscripcionDto> = {},
): UpdateInscripcionDto {
  return {
    montoBonificado: 5000,
    declaracionDeSalud: true,
    ...overrides,
  };
}

// ============================================================================
// MOCK SERVICE INTERFACES (Vitest compatible)
// ============================================================================

// Generic spy type that works with both Vitest and Jasmine
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockFn = (...args: any[]) => any;

/**
 * Typed Mock InscripcionesStateService
 * Compatible with both Vitest (vi.fn) and Jasmine (jasmine.createSpy)
 */
export interface MockInscripcionesStateService {
  // Signals
  inscripciones: WritableSignal<Inscripcion[]>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  selected: WritableSignal<Inscripcion | null>;
  selectedDetail: WritableSignal<InscripcionConEstado | null>;
  inscripcionesGrupo: WritableSignal<Inscripcion[]>;
  inscripcionesScoutArgentina: WritableSignal<Inscripcion[]>;
  totalInscripciones: WritableSignal<number>;
  totalMontoEsperado: WritableSignal<number>;
  // Methods
  load: MockFn;
  loadDetail: MockFn;
  loadByPersona: MockFn;
  loadByAno: MockFn;
  loadByTipo: MockFn;
  create: MockFn;
  update: MockFn;
  delete: MockFn;
  select: MockFn;
  clear: MockFn;
  // Payment methods
  pagarInscripcion: MockFn;
  updatePago: MockFn;
  deletePago: MockFn;
}

/**
 * Create mock InscripcionesStateService for Vitest
 * Uses vi.fn() for mocking
 */
export function createMockInscripcionesStateServiceVitest(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi: any,
): MockInscripcionesStateService {
  return {
    // Signals
    inscripciones: signal<Inscripcion[]>([]),
    loading: signal<boolean>(false),
    error: signal<string | null>(null),
    selected: signal<Inscripcion | null>(null),
    selectedDetail: signal<InscripcionConEstado | null>(null),
    inscripcionesGrupo: signal<Inscripcion[]>([]),
    inscripcionesScoutArgentina: signal<Inscripcion[]>([]),
    totalInscripciones: signal<number>(0),
    totalMontoEsperado: signal<number>(0),
    // Methods
    load: vi.fn(),
    loadDetail: vi.fn(),
    loadByPersona: vi.fn(),
    loadByAno: vi.fn(),
    loadByTipo: vi.fn(),
    create: vi.fn().mockReturnValue(of(createMockInscripcion())),
    update: vi.fn().mockReturnValue(of(createMockInscripcion())),
    delete: vi.fn().mockReturnValue(of(undefined)),
    select: vi.fn(),
    clear: vi.fn(),
    // Payment methods
    pagarInscripcion: vi.fn().mockReturnValue(of(createParcialScenario())),
    updatePago: vi.fn().mockReturnValue(of(createParcialScenario())),
    deletePago: vi.fn().mockReturnValue(of(createPendienteScenario())),
  };
}

/**
 * Mock CajasApiService for payment tests
 */
export interface MockCajasApiService {
  getSaldoCuentaPersonal: MockFn;
}

/**
 * Create mock CajasApiService for Vitest
 */
export function createMockCajasApiServiceVitest(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi: any,
  saldoCuentaPersonal = 5000,
): MockCajasApiService {
  return {
    getSaldoCuentaPersonal: vi.fn().mockReturnValue(of(saldoCuentaPersonal)),
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
    extractCreateDto: (form: FormGroup): CreateInscripcionDto => form.value as CreateInscripcionDto,
    extractUpdateDto: (form: FormGroup): UpdateInscripcionDto => form.value as UpdateInscripcionDto,
  };
}
