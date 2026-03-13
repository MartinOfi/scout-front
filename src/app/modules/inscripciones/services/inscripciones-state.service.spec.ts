/**
 * InscripcionesStateService Tests
 * Comprehensive tests covering all payment scenarios
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 *
 * Payment Scenarios Tested:
 * 1. PENDIENTE - No payment received
 * 2. PARCIAL - Partial payment made
 * 3. PAGADO sin caja personal - Fully paid without personal account
 * 4. PAGADO con caja personal - Fully paid with personal account
 * 5. BONIFICADO total - Fully bonified
 * 6. BONIFICADO parcial - Partial bonification + payment
 * 7. MIXTO - Combination of bonification + payment + personal balance
 * 8. CUOTAS en progreso - Paid in installments (partial)
 * 9. CUOTAS completas - Paid in installments (complete)
 */

import { TestBed } from '@angular/core/testing';
import { of, throwError, firstValueFrom, Subject } from 'rxjs';
import { vi, Mock, describe, it, expect, beforeEach } from 'vitest';

import { InscripcionesStateService } from './inscripciones-state.service';
import { InscripcionesApiService } from './inscripciones-api.service';
import { NotificationService } from '../../../shared/services';
import {
  CreateInscripcionDto,
  UpdateInscripcionDto,
  PagoInscripcionDto,
  UpdatePagoDto,
} from '../../../shared/models';

import {
  createMockInscripcion,
  createMockInscripcionConEstado,
  createMockCreateDto,
  createMockUpdateDto,
  createMockPagoDto,
  createMockUpdatePagoDto,
  createPendienteScenario,
  createParcialScenario,
  createPagadoSinCajaPersonalScenario,
  createPagadoConCajaPersonalScenario,
  createBonificadoTotalScenario,
  createBonificadoParcialScenario,
  createMixtoScenario,
  createCuotasScenario,
  createCuotasCompletasScenario,
  createCuotasEnProgresoScenario,
} from '../testing/inscripciones-test-utils';

// Helper to flush microtask queue (browser-compatible)
const flushPromises = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

// Mock type for Vitest
interface MockApiService {
  getAll: Mock;
  getById: Mock;
  getByPersona: Mock;
  create: Mock;
  update: Mock;
  delete: Mock;
  pagarInscripcion: Mock;
  updatePago: Mock;
  deletePago: Mock;
}

interface MockNotificationService {
  showSuccess: Mock;
  showError: Mock;
}

describe('InscripcionesStateService', () => {
  let service: InscripcionesStateService;
  let mockApiService: MockApiService;
  let mockNotificationService: MockNotificationService;

  beforeEach(() => {
    mockApiService = {
      getAll: vi.fn(),
      getById: vi.fn(),
      getByPersona: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      pagarInscripcion: vi.fn(),
      updatePago: vi.fn(),
      deletePago: vi.fn(),
    };

    mockNotificationService = {
      showSuccess: vi.fn(),
      showError: vi.fn(),
    };

    // Set default return values
    mockApiService.getAll.mockReturnValue(of([]));
    mockApiService.getById.mockReturnValue(of(createPendienteScenario()));
    mockApiService.getByPersona.mockReturnValue(of([]));
    mockApiService.create.mockReturnValue(of(createMockInscripcion()));
    mockApiService.update.mockReturnValue(of(createMockInscripcion()));
    mockApiService.delete.mockReturnValue(of(undefined));
    mockApiService.pagarInscripcion.mockReturnValue(of(createParcialScenario()));
    mockApiService.updatePago.mockReturnValue(of(createParcialScenario()));
    mockApiService.deletePago.mockReturnValue(of(createPendienteScenario()));

    TestBed.configureTestingModule({
      providers: [
        InscripcionesStateService,
        { provide: InscripcionesApiService, useValue: mockApiService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    });

    service = TestBed.inject(InscripcionesStateService);
  });

  // ==========================================================================
  // INITIAL STATE
  // ==========================================================================

  describe('Initial State', () => {
    it('should have empty inscripciones', () => {
      expect(service.inscripciones()).toEqual([]);
    });

    it('should have loading set to false', () => {
      expect(service.loading()).toBe(false);
    });

    it('should have error set to null', () => {
      expect(service.error()).toBeNull();
    });

    it('should have selectedDetail set to null', () => {
      expect(service.selectedDetail()).toBeNull();
    });

    it('should have selected set to null', () => {
      expect(service.selected()).toBeNull();
    });
  });

  // ==========================================================================
  // COMPUTED SIGNALS
  // ==========================================================================

  describe('Computed Signals', () => {
    const grupoInscripcion = createMockInscripcion({ id: 'g1', tipo: 'grupo', montoTotal: 5000 });
    const scoutInscripcion = createMockInscripcion({
      id: 's1',
      tipo: 'scout_argentina',
      montoTotal: 10000,
    });

    beforeEach(async () => {
      mockApiService.getAll.mockReturnValue(of([grupoInscripcion, scoutInscripcion]));
      service.load();
      await flushPromises();
    });

    it('inscripcionesGrupo should filter by tipo grupo', () => {
      expect(service.inscripcionesGrupo().length).toBe(1);
      expect(service.inscripcionesGrupo()[0].id).toBe('g1');
    });

    it('inscripcionesScoutArgentina should filter by tipo scout_argentina', () => {
      expect(service.inscripcionesScoutArgentina().length).toBe(1);
      expect(service.inscripcionesScoutArgentina()[0].id).toBe('s1');
    });

    it('totalInscripciones should return count', () => {
      expect(service.totalInscripciones()).toBe(2);
    });

    it('totalMontoEsperado should sum (montoTotal - montoBonificado)', () => {
      // 5000 + 10000 = 15000 (no bonificaciones)
      expect(service.totalMontoEsperado()).toBe(15000);
    });

    it('totalMontoEsperado should subtract bonificaciones', async () => {
      const withBonif = createMockInscripcion({
        id: 'b1',
        montoTotal: 10000,
        montoBonificado: 3000,
      });
      mockApiService.getAll.mockReturnValue(of([withBonif]));
      service.load();
      await flushPromises();
      // 10000 - 3000 = 7000
      expect(service.totalMontoEsperado()).toBe(7000);
    });
  });

  // ==========================================================================
  // LOAD OPERATIONS
  // ==========================================================================

  describe('load()', () => {
    it('should set loading to true while loading', () => {
      // Use a Subject to control when the Observable emits
      const loadSubject = new Subject<never>();
      mockApiService.getAll.mockReturnValue(loadSubject.asObservable());

      service.load();
      expect(service.loading()).toBe(true);

      // Complete the subject to avoid memory leaks
      loadSubject.complete();
    });

    it('should call apiService.getAll with params', () => {
      service.load({ ano: 2026, tipo: 'scout_argentina' });
      expect(mockApiService.getAll).toHaveBeenCalledWith({ ano: 2026, tipo: 'scout_argentina' });
    });

    it('should update inscripciones signal on success', async () => {
      const mockData = [createMockInscripcion({ id: '1' }), createMockInscripcion({ id: '2' })];
      mockApiService.getAll.mockReturnValue(of(mockData));

      service.load();
      await flushPromises();

      expect(service.inscripciones()).toEqual(mockData);
      expect(service.loading()).toBe(false);
    });

    it('should set error and show notification on failure', async () => {
      const errorMsg = 'Network error';
      mockApiService.getAll.mockReturnValue(throwError(() => new Error(errorMsg)));

      service.load();
      await flushPromises();

      expect(service.error()).toBe(errorMsg);
      expect(service.loading()).toBe(false);
      expect(mockNotificationService.showError).toHaveBeenCalledWith(errorMsg);
    });

    it('should handle non-Error errors with default message', async () => {
      mockApiService.getAll.mockReturnValue(throwError(() => 'Unknown error'));

      service.load();
      await flushPromises();

      expect(service.error()).toBe('Error al cargar inscripciones');
    });
  });

  describe('loadByAno()', () => {
    it('should call load with ano parameter', () => {
      const loadSpy = vi.spyOn(service, 'load');
      service.loadByAno(2026);
      expect(loadSpy).toHaveBeenCalledWith({ ano: 2026 });
    });
  });

  describe('loadByTipo()', () => {
    it('should call load with tipo parameter', () => {
      const loadSpy = vi.spyOn(service, 'load');
      service.loadByTipo('grupo');
      expect(loadSpy).toHaveBeenCalledWith({ tipo: 'grupo' });
    });
  });

  describe('loadByPersona()', () => {
    it('should call apiService.getByPersona', () => {
      service.loadByPersona('pers-123');
      expect(mockApiService.getByPersona).toHaveBeenCalledWith('pers-123');
    });

    it('should update inscripciones on success', async () => {
      const mockData = [createMockInscripcion({ personaId: 'pers-123' })];
      mockApiService.getByPersona.mockReturnValue(of(mockData));

      service.loadByPersona('pers-123');
      await flushPromises();

      expect(service.inscripciones()).toEqual(mockData);
    });

    it('should handle errors correctly', async () => {
      mockApiService.getByPersona.mockReturnValue(throwError(() => new Error('Not found')));

      service.loadByPersona('pers-invalid');
      await flushPromises();

      expect(service.error()).toBe('Not found');
      expect(mockNotificationService.showError).toHaveBeenCalled();
    });
  });

  describe('loadDetail()', () => {
    it('should call apiService.getById', () => {
      service.loadDetail('insc-1');
      expect(mockApiService.getById).toHaveBeenCalledWith('insc-1');
    });

    it('should update selectedDetail on success', async () => {
      const detail = createPendienteScenario();
      mockApiService.getById.mockReturnValue(of(detail));

      service.loadDetail('insc-1');
      await flushPromises();

      expect(service.selectedDetail()).toEqual(detail);
    });

    it('should handle errors correctly', async () => {
      mockApiService.getById.mockReturnValue(throwError(() => new Error('Not found')));

      service.loadDetail('invalid');
      await flushPromises();

      expect(service.error()).toBe('Not found');
    });
  });

  // ==========================================================================
  // CRUD OPERATIONS
  // ==========================================================================

  describe('create()', () => {
    const dto: CreateInscripcionDto = createMockCreateDto();

    it('should call apiService.create with dto', async () => {
      await firstValueFrom(service.create(dto));
      expect(mockApiService.create).toHaveBeenCalledWith(dto);
    });

    it('should add new inscripcion to state', async () => {
      const newInscripcion = createMockInscripcion({ id: 'new-1' });
      mockApiService.create.mockReturnValue(of(newInscripcion));

      await firstValueFrom(service.create(dto));

      expect(service.inscripciones()).toContain(newInscripcion);
    });

    it('should show success notification', async () => {
      await firstValueFrom(service.create(dto));
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
        'Inscripción creada exitosamente',
      );
    });

    it('should handle errors and throw', async () => {
      mockApiService.create.mockReturnValue(throwError(() => new Error('Validation error')));

      await expect(firstValueFrom(service.create(dto))).rejects.toThrow('Validation error');
      expect(service.error()).toBe('Validation error');
    });
  });

  describe('update()', () => {
    const dto: UpdateInscripcionDto = createMockUpdateDto();

    beforeEach(async () => {
      // Pre-populate state with an inscripcion
      mockApiService.getAll.mockReturnValue(of([createMockInscripcion({ id: 'insc-1' })]));
      service.load();
      await flushPromises();
    });

    it('should call apiService.update with id and dto', async () => {
      await firstValueFrom(service.update('insc-1', dto));
      expect(mockApiService.update).toHaveBeenCalledWith('insc-1', dto);
    });

    it('should update inscripcion in state', async () => {
      const updated = createMockInscripcion({ id: 'insc-1', montoBonificado: 5000 });
      mockApiService.update.mockReturnValue(of(updated));

      await firstValueFrom(service.update('insc-1', dto));

      const found = service.inscripciones().find((i) => i.id === 'insc-1');
      expect(found?.montoBonificado).toBe(5000);
    });

    it('should show success notification', async () => {
      await firstValueFrom(service.update('insc-1', dto));
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
        'Inscripción actualizada exitosamente',
      );
    });
  });

  describe('delete()', () => {
    beforeEach(async () => {
      mockApiService.getAll.mockReturnValue(
        of([createMockInscripcion({ id: 'insc-1' }), createMockInscripcion({ id: 'insc-2' })]),
      );
      service.load();
      await flushPromises();
    });

    it('should call apiService.delete with id', async () => {
      await firstValueFrom(service.delete('insc-1'));
      expect(mockApiService.delete).toHaveBeenCalledWith('insc-1');
    });

    it('should remove inscripcion from state', async () => {
      expect(service.inscripciones().length).toBe(2);

      await firstValueFrom(service.delete('insc-1'));

      expect(service.inscripciones().length).toBe(1);
      expect(service.inscripciones().find((i) => i.id === 'insc-1')).toBeUndefined();
    });

    it('should show success notification', async () => {
      await firstValueFrom(service.delete('insc-1'));
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
        'Inscripción eliminada exitosamente',
      );
    });
  });

  // ==========================================================================
  // PAYMENT SCENARIOS - ESCENARIO 1: PENDIENTE
  // ==========================================================================

  describe('Payment Scenario: PENDIENTE (No payment)', () => {
    it('should load detail with estado pendiente', async () => {
      const pendiente = createPendienteScenario();
      mockApiService.getById.mockReturnValue(of(pendiente));

      service.loadDetail('insc-pendiente');
      await flushPromises();

      const detail = service.selectedDetail();
      expect(detail?.estado).toBe('pendiente');
      expect(detail?.montoPagado).toBe(0);
      expect(detail?.saldoPendiente).toBe(15000);
      expect(detail?.movimientos).toEqual([]);
    });

    it('should transition from pendiente to parcial on first payment', async () => {
      const pendiente = createPendienteScenario();
      const afterPayment = createParcialScenario(15000, 5000);
      mockApiService.getById.mockReturnValue(of(pendiente));
      mockApiService.pagarInscripcion.mockReturnValue(of(afterPayment));

      // Load detail
      service.select('insc-pendiente');
      await flushPromises();

      // Make payment
      const dto: PagoInscripcionDto = createMockPagoDto({ montoPagado: 5000 });
      await firstValueFrom(service.pagarInscripcion('insc-pendiente', dto));

      const detail = service.selectedDetail();
      expect(detail?.estado).toBe('parcial');
      expect(detail?.montoPagado).toBe(5000);
      expect(detail?.saldoPendiente).toBe(10000);
    });
  });

  // ==========================================================================
  // PAYMENT SCENARIOS - ESCENARIO 2: PARCIAL
  // ==========================================================================

  describe('Payment Scenario: PARCIAL (Partial payment)', () => {
    it('should load detail with estado parcial', async () => {
      const parcial = createParcialScenario(15000, 7000);
      mockApiService.getById.mockReturnValue(of(parcial));

      service.loadDetail('insc-parcial');
      await flushPromises();

      const detail = service.selectedDetail();
      expect(detail?.estado).toBe('parcial');
      expect(detail?.montoPagado).toBe(7000);
      expect(detail?.saldoPendiente).toBe(8000);
      expect(detail?.movimientos.length).toBe(1);
    });

    it('should transition from parcial to pagado on complete payment', async () => {
      const parcial = createParcialScenario(15000, 10000);
      const pagado = createPagadoSinCajaPersonalScenario(15000);
      mockApiService.getById.mockReturnValue(of(parcial));
      mockApiService.pagarInscripcion.mockReturnValue(of(pagado));

      service.select('insc-parcial');
      await flushPromises();

      const dto: PagoInscripcionDto = createMockPagoDto({ montoPagado: 5000 });
      await firstValueFrom(service.pagarInscripcion('insc-parcial', dto));

      const detail = service.selectedDetail();
      expect(detail?.estado).toBe('pagado');
      expect(detail?.saldoPendiente).toBe(0);
    });
  });

  // ==========================================================================
  // PAYMENT SCENARIOS - ESCENARIO 3: PAGADO SIN CAJA PERSONAL
  // ==========================================================================

  describe('Payment Scenario: PAGADO sin caja personal', () => {
    it('should load detail with estado pagado and transferencia payment', async () => {
      const pagado = createPagadoSinCajaPersonalScenario(15000);
      mockApiService.getById.mockReturnValue(of(pagado));

      service.loadDetail('insc-pagado-sin-caja');
      await flushPromises();

      const detail = service.selectedDetail();
      expect(detail?.estado).toBe('pagado');
      expect(detail?.montoPagado).toBe(15000);
      expect(detail?.saldoPendiente).toBe(0);
      expect(detail?.movimientos[0].medioPago).toBe('transferencia');
    });
  });

  // ==========================================================================
  // PAYMENT SCENARIOS - ESCENARIO 4: PAGADO CON CAJA PERSONAL
  // ==========================================================================

  describe('Payment Scenario: PAGADO con caja personal', () => {
    it('should load detail with saldo_personal payment method', async () => {
      const pagado = createPagadoConCajaPersonalScenario(15000);
      mockApiService.getById.mockReturnValue(of(pagado));

      service.loadDetail('insc-pagado-con-caja');
      await flushPromises();

      const detail = service.selectedDetail();
      expect(detail?.estado).toBe('pagado');
      expect(detail?.movimientos[0].medioPago).toBe('saldo_personal');
    });

    it('should create payment with montoConSaldoPersonal', async () => {
      const pendiente = createPendienteScenario();
      const pagado = createPagadoConCajaPersonalScenario(15000);
      mockApiService.getById.mockReturnValue(of(pendiente));
      mockApiService.pagarInscripcion.mockReturnValue(of(pagado));

      service.select('insc-pendiente');
      await flushPromises();

      const dto: PagoInscripcionDto = {
        montoPagado: 0,
        montoConSaldoPersonal: 15000,
        medioPago: 'efectivo', // not used when paying with saldo
      };
      await firstValueFrom(service.pagarInscripcion('insc-pendiente', dto));

      expect(mockApiService.pagarInscripcion).toHaveBeenCalledWith('insc-pendiente', dto);
      expect(service.selectedDetail()?.estado).toBe('pagado');
    });
  });

  // ==========================================================================
  // PAYMENT SCENARIOS - ESCENARIO 5: BONIFICADO TOTAL
  // ==========================================================================

  describe('Payment Scenario: BONIFICADO total', () => {
    it('should load detail with estado bonificado and no movimientos', async () => {
      const bonificado = createBonificadoTotalScenario(15000);
      mockApiService.getById.mockReturnValue(of(bonificado));

      service.loadDetail('insc-bonificado-total');
      await flushPromises();

      const detail = service.selectedDetail();
      expect(detail?.estado).toBe('bonificado');
      expect(detail?.montoBonificado).toBe(15000);
      expect(detail?.montoPagado).toBe(0);
      expect(detail?.saldoPendiente).toBe(0);
      expect(detail?.movimientos).toEqual([]);
    });

    it('should create fully bonified inscripcion', async () => {
      const bonificado = createBonificadoTotalScenario(15000);
      mockApiService.create.mockReturnValue(of(bonificado));

      const dto: CreateInscripcionDto = {
        ...createMockCreateDto(),
        montoBonificado: 15000,
      };
      await firstValueFrom(service.create(dto));

      expect(mockApiService.create).toHaveBeenCalledWith(
        expect.objectContaining({ montoBonificado: 15000 }),
      );
    });
  });

  // ==========================================================================
  // PAYMENT SCENARIOS - ESCENARIO 6: BONIFICADO PARCIAL
  // ==========================================================================

  describe('Payment Scenario: BONIFICADO parcial + payment', () => {
    it('should load detail with partial bonification fully paid', async () => {
      const bonificadoParcial = createBonificadoParcialScenario(15000, 5000);
      mockApiService.getById.mockReturnValue(of(bonificadoParcial));

      service.loadDetail('insc-bonificado-parcial');
      await flushPromises();

      const detail = service.selectedDetail();
      expect(detail?.estado).toBe('pagado');
      expect(detail?.montoBonificado).toBe(5000);
      expect(detail?.montoPagado).toBe(10000); // 15000 - 5000
      expect(detail?.saldoPendiente).toBe(0);
    });

    it('should update bonification amount', async () => {
      const original = createMockInscripcion({ id: 'insc-1', montoBonificado: 0 });
      const updated = createMockInscripcion({ id: 'insc-1', montoBonificado: 5000 });
      mockApiService.getAll.mockReturnValue(of([original]));
      mockApiService.update.mockReturnValue(of(updated));

      service.load();
      await flushPromises();

      const dto: UpdateInscripcionDto = { montoBonificado: 5000 };
      await firstValueFrom(service.update('insc-1', dto));

      expect(service.inscripciones()[0].montoBonificado).toBe(5000);
    });
  });

  // ==========================================================================
  // PAYMENT SCENARIOS - ESCENARIO 7: MIXTO
  // ==========================================================================

  describe('Payment Scenario: MIXTO (bonification + efectivo + saldo personal)', () => {
    it('should load detail with mixed payment sources', async () => {
      // 15000 total, 3000 bonificado, 6000 efectivo, 6000 saldo = pagado
      const mixto = createMixtoScenario(15000, 3000, 6000, 6000);
      mockApiService.getById.mockReturnValue(of(mixto));

      service.loadDetail('insc-mixto');
      await flushPromises();

      const detail = service.selectedDetail();
      expect(detail?.estado).toBe('pagado');
      expect(detail?.montoBonificado).toBe(3000);
      expect(detail?.montoPagado).toBe(12000); // 6000 + 6000
      expect(detail?.saldoPendiente).toBe(0);
      expect(detail?.movimientos.length).toBe(2);
    });

    it('should handle mixed payment with remaining balance', async () => {
      // 15000 total, 3000 bonificado, 4000 efectivo, 4000 saldo = 4000 pendiente
      const mixto = createMixtoScenario(15000, 3000, 4000, 4000);
      mockApiService.getById.mockReturnValue(of(mixto));

      service.loadDetail('insc-mixto');
      await flushPromises();

      const detail = service.selectedDetail();
      expect(detail?.estado).toBe('parcial');
      expect(detail?.saldoPendiente).toBe(4000);
    });

    it('should have movimientos with different payment methods', async () => {
      const mixto = createMixtoScenario(15000, 3000, 6000, 6000);
      mockApiService.getById.mockReturnValue(of(mixto));

      service.loadDetail('insc-mixto');
      await flushPromises();

      const movimientos = service.selectedDetail()?.movimientos ?? [];
      const methods = movimientos.map((m) => m.medioPago);
      expect(methods).toContain('efectivo');
      expect(methods).toContain('saldo_personal');
    });
  });

  // ==========================================================================
  // PAYMENT SCENARIOS - ESCENARIO 8: CUOTAS EN PROGRESO
  // ==========================================================================

  describe('Payment Scenario: CUOTAS en progreso (installments partial)', () => {
    it('should load detail with multiple movimientos', async () => {
      const cuotas = createCuotasEnProgresoScenario();
      mockApiService.getById.mockReturnValue(of(cuotas));

      service.loadDetail('insc-cuotas');
      await flushPromises();

      const detail = service.selectedDetail();
      expect(detail?.estado).toBe('parcial');
      expect(detail?.montoPagado).toBe(8000); // 5000 + 3000
      expect(detail?.saldoPendiente).toBe(7000);
      expect(detail?.movimientos.length).toBe(2);
    });

    it('should track payment dates in movimientos', async () => {
      const cuotas = createCuotasEnProgresoScenario();
      mockApiService.getById.mockReturnValue(of(cuotas));

      service.loadDetail('insc-cuotas');
      await flushPromises();

      const movimientos = service.selectedDetail()?.movimientos ?? [];
      expect(movimientos[0].fecha).toContain('2026-01');
      expect(movimientos[1].fecha).toContain('2026-02');
    });
  });

  // ==========================================================================
  // PAYMENT SCENARIOS - ESCENARIO 9: CUOTAS COMPLETAS
  // ==========================================================================

  describe('Payment Scenario: CUOTAS completas (fully paid in installments)', () => {
    it('should load detail as pagado with 3 movimientos', async () => {
      const cuotas = createCuotasCompletasScenario();
      mockApiService.getById.mockReturnValue(of(cuotas));

      service.loadDetail('insc-cuotas');
      await flushPromises();

      const detail = service.selectedDetail();
      expect(detail?.estado).toBe('pagado');
      expect(detail?.montoPagado).toBe(15000);
      expect(detail?.saldoPendiente).toBe(0);
      expect(detail?.movimientos.length).toBe(3);
    });

    it('should have chronological movimientos', async () => {
      const cuotas = createCuotasCompletasScenario();
      mockApiService.getById.mockReturnValue(of(cuotas));

      service.loadDetail('insc-cuotas');
      await flushPromises();

      const movimientos = service.selectedDetail()?.movimientos ?? [];
      const dates = movimientos.map((m) => m.fecha);
      expect(dates[0] < dates[1]).toBe(true);
      expect(dates[1] < dates[2]).toBe(true);
    });
  });

  // ==========================================================================
  // PAYMENT OPERATIONS
  // ==========================================================================

  describe('pagarInscripcion()', () => {
    const dto: PagoInscripcionDto = createMockPagoDto();

    beforeEach(async () => {
      const inscripcion = createMockInscripcion({ id: 'insc-1' });
      mockApiService.getAll.mockReturnValue(of([inscripcion]));
      mockApiService.getById.mockReturnValue(of(createPendienteScenario()));
      service.load();
      service.select('insc-1');
      await flushPromises();
    });

    it('should call apiService.pagarInscripcion', async () => {
      await firstValueFrom(service.pagarInscripcion('insc-1', dto));
      expect(mockApiService.pagarInscripcion).toHaveBeenCalledWith('insc-1', dto);
    });

    it('should update selectedDetail on success', async () => {
      const updated = createParcialScenario();
      mockApiService.pagarInscripcion.mockReturnValue(of(updated));

      await firstValueFrom(service.pagarInscripcion('insc-1', dto));

      expect(service.selectedDetail()?.estado).toBe('parcial');
    });

    it('should update inscripciones list', async () => {
      const updated = createParcialScenario();
      mockApiService.pagarInscripcion.mockReturnValue(of(updated));

      await firstValueFrom(service.pagarInscripcion('insc-1', dto));

      // The updated inscripcion should be in the list
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
        'Pago registrado exitosamente',
      );
    });

    it('should show success notification', async () => {
      await firstValueFrom(service.pagarInscripcion('insc-1', dto));
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
        'Pago registrado exitosamente',
      );
    });

    it('should handle errors correctly', async () => {
      mockApiService.pagarInscripcion.mockReturnValue(
        throwError(() => new Error('Insufficient funds')),
      );

      await expect(firstValueFrom(service.pagarInscripcion('insc-1', dto))).rejects.toThrow(
        'Insufficient funds',
      );
      expect(service.error()).toBe('Insufficient funds');
    });
  });

  describe('updatePago()', () => {
    const dto: UpdatePagoDto = createMockUpdatePagoDto();

    beforeEach(async () => {
      const inscripcion = createMockInscripcion({ id: 'insc-1' });
      const detail = createParcialScenario();
      mockApiService.getAll.mockReturnValue(of([inscripcion]));
      mockApiService.getById.mockReturnValue(of(detail));
      service.load();
      service.select('insc-1');
      await flushPromises();
    });

    it('should call apiService.updatePago', async () => {
      await firstValueFrom(service.updatePago('insc-1', 'mov-1', dto));
      expect(mockApiService.updatePago).toHaveBeenCalledWith('insc-1', 'mov-1', dto);
    });

    it('should update selectedDetail on success', async () => {
      const updated = createParcialScenario(15000, 6000); // Updated amount
      mockApiService.updatePago.mockReturnValue(of(updated));

      await firstValueFrom(service.updatePago('insc-1', 'mov-1', dto));

      expect(service.selectedDetail()?.montoPagado).toBe(6000);
    });

    it('should show success notification', async () => {
      await firstValueFrom(service.updatePago('insc-1', 'mov-1', dto));
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
        'Pago actualizado exitosamente',
      );
    });

    it('should handle errors correctly', async () => {
      mockApiService.updatePago.mockReturnValue(throwError(() => new Error('Not found')));

      await expect(firstValueFrom(service.updatePago('insc-1', 'mov-1', dto))).rejects.toThrow(
        'Not found',
      );
      expect(service.error()).toBe('Not found');
    });
  });

  describe('deletePago()', () => {
    beforeEach(async () => {
      const inscripcion = createMockInscripcion({ id: 'insc-1' });
      const detail = createParcialScenario();
      mockApiService.getAll.mockReturnValue(of([inscripcion]));
      mockApiService.getById.mockReturnValue(of(detail));
      service.load();
      service.select('insc-1');
      await flushPromises();
    });

    it('should call apiService.deletePago', async () => {
      await firstValueFrom(service.deletePago('insc-1', 'mov-1'));
      expect(mockApiService.deletePago).toHaveBeenCalledWith('insc-1', 'mov-1');
    });

    it('should update selectedDetail to pendiente after last payment deleted', async () => {
      const pendiente = createPendienteScenario();
      mockApiService.deletePago.mockReturnValue(of(pendiente));

      await firstValueFrom(service.deletePago('insc-1', 'mov-1'));

      expect(service.selectedDetail()?.estado).toBe('pendiente');
      expect(service.selectedDetail()?.montoPagado).toBe(0);
    });

    it('should show success notification', async () => {
      await firstValueFrom(service.deletePago('insc-1', 'mov-1'));
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
        'Pago eliminado exitosamente',
      );
    });

    it('should handle errors correctly', async () => {
      mockApiService.deletePago.mockReturnValue(throwError(() => new Error('Cannot delete')));

      await expect(firstValueFrom(service.deletePago('insc-1', 'mov-1'))).rejects.toThrow(
        'Cannot delete',
      );
      expect(service.error()).toBe('Cannot delete');
    });
  });

  // ==========================================================================
  // SELECTION OPERATIONS
  // ==========================================================================

  describe('select()', () => {
    it('should call loadDetail when selecting an id', async () => {
      const loadDetailSpy = vi.spyOn(service, 'loadDetail');
      service.select('insc-1');
      await flushPromises();
      expect(loadDetailSpy).toHaveBeenCalledWith('insc-1');
    });

    it('should clear selectedDetail when selecting null', () => {
      service.select(null);
      expect(service.selectedDetail()).toBeNull();
    });
  });

  describe('clear()', () => {
    beforeEach(async () => {
      mockApiService.getAll.mockReturnValue(of([createMockInscripcion()]));
      service.load();
      await flushPromises();
    });

    it('should reset all state', () => {
      service.clear();

      expect(service.inscripciones()).toEqual([]);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBeNull();
      expect(service.selectedDetail()).toBeNull();
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle zero montoTotal inscripcion', async () => {
      const zeroTotal = createMockInscripcionConEstado({ montoTotal: 0 }, 0, 'pagado', []);
      mockApiService.getById.mockReturnValue(of(zeroTotal));

      service.loadDetail('zero');
      await flushPromises();

      expect(service.selectedDetail()?.saldoPendiente).toBe(0);
    });

    it('should handle inscripcion with montoTotal equal to montoBonificado', async () => {
      const fullyBonified = createBonificadoTotalScenario(10000);
      mockApiService.getById.mockReturnValue(of(fullyBonified));

      service.loadDetail('fully-bonified');
      await flushPromises();

      const detail = service.selectedDetail();
      expect(detail?.montoTotal).toBe(detail?.montoBonificado);
      expect(detail?.saldoPendiente).toBe(0);
    });

    it('should not update selectedDetail if different id selected', async () => {
      const detail1 = createPendienteScenario();
      mockApiService.getById.mockReturnValue(of(detail1));
      service.select('insc-1');
      await flushPromises();

      // Now pay for a different inscripcion
      const updated2 = createParcialScenario();
      updated2.id = 'insc-2';
      mockApiService.pagarInscripcion.mockReturnValue(of(updated2));

      await firstValueFrom(service.pagarInscripcion('insc-2', createMockPagoDto()));

      // selectedDetail should still be insc-1 (not updated)
      expect(service.selectedDetail()?.id).toBe('insc-pendiente');
    });

    it('should handle multiple rapid payments', async () => {
      const pendiente = createPendienteScenario();
      mockApiService.getById.mockReturnValue(of(pendiente));
      service.select('insc-1');
      await flushPromises();

      // Simulate 3 rapid payments
      const payment1 = createParcialScenario(15000, 5000);
      const payment2 = createParcialScenario(15000, 10000);
      const payment3 = createPagadoSinCajaPersonalScenario(15000);

      mockApiService.pagarInscripcion
        .mockReturnValueOnce(of(payment1))
        .mockReturnValueOnce(of(payment2))
        .mockReturnValueOnce(of(payment3));

      await Promise.all([
        firstValueFrom(
          service.pagarInscripcion('insc-1', createMockPagoDto({ montoPagado: 5000 })),
        ),
        firstValueFrom(
          service.pagarInscripcion('insc-1', createMockPagoDto({ montoPagado: 5000 })),
        ),
        firstValueFrom(
          service.pagarInscripcion('insc-1', createMockPagoDto({ montoPagado: 5000 })),
        ),
      ]);

      expect(mockApiService.pagarInscripcion).toHaveBeenCalledTimes(3);
      expect(service.selectedDetail()?.estado).toBe('pagado');
    });

    it('should handle cuotas with mixed payment methods', async () => {
      const mixedCuotas = createCuotasScenario(15000, [
        { monto: 5000, fecha: '2026-01-15T10:00:00Z', medioPago: 'efectivo' },
        { monto: 5000, fecha: '2026-02-15T10:00:00Z', medioPago: 'transferencia' },
        { monto: 5000, fecha: '2026-03-15T10:00:00Z', medioPago: 'saldo_personal' },
      ]);
      mockApiService.getById.mockReturnValue(of(mixedCuotas));

      service.loadDetail('mixed-cuotas');
      await flushPromises();

      const movimientos = service.selectedDetail()?.movimientos ?? [];
      expect(movimientos[0].medioPago).toBe('efectivo');
      expect(movimientos[1].medioPago).toBe('transferencia');
      expect(movimientos[2].medioPago).toBe('saldo_personal');
    });
  });
});
