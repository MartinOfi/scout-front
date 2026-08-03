import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi, Mock, describe, it, expect, beforeEach } from 'vitest';

import { CajasStateService } from './cajas-state.service';
import { CajasApiService } from './cajas-api.service';
import { ErrorHandlerService, NotificationService } from '../../../shared/services';
import { ConsolidadoSaldosResponse } from '../../../shared/models';

interface MockApiService {
  getCajaGrupo: Mock;
  getConsolidado: Mock;
  getByType: Mock;
  getPersonales: Mock;
  getMovimientos: Mock;
  create: Mock;
}

const mockConsolidado: ConsolidadoSaldosResponse = {
  fecha: '2026-08-03T00:00:00.000Z',
  resumen: { totalGeneral: 0, totalDisponible: 0, totalPorCobrar: 0 },
  cajaGrupo: { id: 'grupo-id', saldo: 0 },
  fondosRama: { total: 0, detalle: [] },
  cuentasPersonales: { total: 0, cantidad: 0 },
  reembolsosPendientes: { total: 0, cantidad: 0 },
  deudasTotales: {
    total: 0,
    inscripciones: { total: 0, cantidad: 0 },
    cuotas: { total: 0, cantidad: 0 },
    campamentos: { total: 0, cantidad: 0 },
  },
  fondoSolidario: { id: null, saldo: 0, bonificacionesOtorgadas: 0 },
};

describe('CajasStateService', () => {
  let service: CajasStateService;
  let mockApiService: MockApiService;

  beforeEach(() => {
    mockApiService = {
      getCajaGrupo: vi.fn(),
      getConsolidado: vi.fn(),
      getByType: vi.fn(),
      getPersonales: vi.fn(),
      getMovimientos: vi.fn(),
      create: vi.fn(),
    };

    mockApiService.getConsolidado.mockReturnValue(of(mockConsolidado));

    TestBed.configureTestingModule({
      providers: [
        CajasStateService,
        { provide: CajasApiService, useValue: mockApiService },
        { provide: NotificationService, useValue: { showSuccess: vi.fn(), showError: vi.fn() } },
        { provide: ErrorHandlerService, useValue: { extractMessage: vi.fn(() => 'error') } },
      ],
    });

    service = TestBed.inject(CajasStateService);
  });

  describe('saldoFondoSolidario / bonificacionesOtorgadas', () => {
    it('expone el saldo del fondo solidario desde el consolidado', () => {
      mockApiService.getConsolidado.mockReturnValue(
        of({
          ...mockConsolidado,
          fondoSolidario: { id: 'fondo-id', saldo: 500000, bonificacionesOtorgadas: 80000 },
        }),
      );

      service.loadConsolidado();

      expect(service.saldoFondoSolidario()).toBe(500000);
      expect(service.bonificacionesOtorgadas()).toBe(80000);
    });

    it('devuelve 0 cuando el fondo solidario no fue creado', () => {
      service.loadConsolidado();

      expect(service.saldoFondoSolidario()).toBe(0);
      expect(service.bonificacionesOtorgadas()).toBe(0);
    });

    it('devuelve 0 antes de cargar el consolidado', () => {
      expect(service.saldoFondoSolidario()).toBe(0);
      expect(service.bonificacionesOtorgadas()).toBe(0);
    });
  });

  describe('cajaFondoSolidarioId', () => {
    it('expone el id cuando la caja ya fue creada', () => {
      mockApiService.getConsolidado.mockReturnValue(
        of({
          ...mockConsolidado,
          fondoSolidario: { id: 'fondo-id', saldo: 500000, bonificacionesOtorgadas: 80000 },
        }),
      );

      service.loadConsolidado();

      expect(service.cajaFondoSolidarioId()).toBe('fondo-id');
    });

    it('devuelve null cuando la caja todavía no fue creada', () => {
      service.loadConsolidado();

      expect(service.cajaFondoSolidarioId()).toBeNull();
    });
  });
});
