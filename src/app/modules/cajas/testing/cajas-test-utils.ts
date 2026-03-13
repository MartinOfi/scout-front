/**
 * Cajas Test Utilities
 * Provides typed mock factories for Cajas module testing
 */

import { vi } from 'vitest';
import { FormBuilder, FormGroup } from '@angular/forms';
import { signal, WritableSignal } from '@angular/core';
import { Caja, CajaConSaldo, Movimiento } from '../../../shared/models';
import {
  CajaType,
  RamaEnum,
  TipoMovimientoEnum,
  ConceptoMovimiento,
  MedioPagoEnum,
  EstadoPago,
} from '../../../shared/enums';

/**
 * Create mock Caja
 */
export function createMockCaja(overrides: Partial<Caja> = {}): Caja {
  return {
    id: 'caja-1',
    tipo: CajaType.GRUPO,
    nombre: null,
    propietarioId: null,
    propietario: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create mock CajaConSaldo
 */
export function createMockCajaConSaldo(overrides: Partial<CajaConSaldo> = {}): CajaConSaldo {
  return {
    id: 'caja-1',
    tipo: CajaType.GRUPO,
    nombre: null,
    propietarioId: null,
    propietario: null,
    saldoActual: 1000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create mock Movimiento
 */
export function createMockMovimiento(overrides: Partial<Movimiento> = {}): Movimiento {
  return {
    id: 'mov-1',
    cajaId: 'caja-1',
    tipo: TipoMovimientoEnum.INGRESO,
    monto: 1000,
    concepto: ConceptoMovimiento.CUOTA_GRUPO,
    fecha: new Date('2024-01-01'),
    descripcion: 'Mock movimiento',
    responsableId: 'resp-1',
    responsableNombreCompleto: 'Responsable Test',
    medioPago: MedioPagoEnum.EFECTIVO,
    estadoPago: EstadoPago.PAGADO,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as Movimiento;
}

/**
 * Typed Mock CajasStateService
 * Uses vi.fn() for spy capabilities (toHaveBeenCalled, toHaveBeenCalledWith)
 */
export interface MockCajasStateService {
  cajaGrupo: WritableSignal<CajaConSaldo | null>;
  cajasRama: WritableSignal<Record<string, CajaConSaldo>>;
  movimientosGrupo: WritableSignal<Movimiento[]>;
  movimientosRama: WritableSignal<Record<string, Movimiento[]>>;
  movimientosPersonal: WritableSignal<Record<string, Movimiento[]>>;
  saldoGrupo: WritableSignal<number>;
  saldoManada: WritableSignal<number>;
  saldoUnidad: WritableSignal<number>;
  saldoCaminantes: WritableSignal<number>;
  saldoRovers: WritableSignal<number>;
  totalSaldosRamas: WritableSignal<number>;
  totalSaldos: WritableSignal<number>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  loadCajaGrupo: ReturnType<typeof vi.fn>;
  loadCajaRama: ReturnType<typeof vi.fn>;
  loadTodasCajasRama: ReturnType<typeof vi.fn>;
  loadMovimientosGrupo: ReturnType<typeof vi.fn>;
  loadMovimientosRama: ReturnType<typeof vi.fn>;
  loadMovimientosPersonal: ReturnType<typeof vi.fn>;
  selectCaja: ReturnType<typeof vi.fn>;
}

/**
 * Create mock CajasStateService
 */
export function createMockCajasStateService(): MockCajasStateService {
  return {
    cajaGrupo: signal<CajaConSaldo | null>(null),
    cajasRama: signal<Record<string, CajaConSaldo>>({}),
    movimientosGrupo: signal<Movimiento[]>([]),
    movimientosRama: signal<Record<string, Movimiento[]>>({}),
    movimientosPersonal: signal<Record<string, Movimiento[]>>({}),
    saldoGrupo: signal<number>(0),
    saldoManada: signal<number>(0),
    saldoUnidad: signal<number>(0),
    saldoCaminantes: signal<number>(0),
    saldoRovers: signal<number>(0),
    totalSaldosRamas: signal<number>(0),
    totalSaldos: signal<number>(0),
    loading: signal<boolean>(false),
    error: signal<string | null>(null),
    loadCajaGrupo: vi.fn(),
    loadCajaRama: vi.fn(),
    loadTodasCajasRama: vi.fn(),
    loadMovimientosGrupo: vi.fn(),
    loadMovimientosRama: vi.fn(),
    loadMovimientosPersonal: vi.fn(),
    selectCaja: vi.fn(),
  };
}

/**
 * Typed Mock CajasFormBuilder
 */
export interface MockCajasFormBuilder {
  buildAsignacionFondoForm: () => FormGroup;
  extractAsignacionDto: (form: FormGroup) => { rama: RamaEnum; monto: number };
}

/**
 * Create mock CajasFormBuilder
 */
export function createMockCajasFormBuilder(): MockCajasFormBuilder {
  const fb = new FormBuilder();

  return {
    buildAsignacionFondoForm: (): FormGroup =>
      fb.group({
        rama: [''],
        monto: [0],
      }),
    extractAsignacionDto: (form: FormGroup): { rama: RamaEnum; monto: number } =>
      form.value as { rama: RamaEnum; monto: number },
  };
}
