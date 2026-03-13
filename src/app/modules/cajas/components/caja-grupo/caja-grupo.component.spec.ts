/**
 * CajaGrupoComponent Tests
 * Tests smart component behavior for caja grupo view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { CajaGrupoComponent } from './caja-grupo.component';
import { CajasStateService } from '../../services/cajas-state.service';
import { CajaConSaldo, Movimiento } from '../../../../shared/models';
import {
  createMockCajasStateService,
  createMockCajaConSaldo,
  createMockMovimiento,
  MockCajasStateService,
} from '../../testing/cajas-test-utils';
import { createMockRouter, MockRouter } from '../../../../shared/testing';

describe('CajaGrupoComponent', () => {
  let component: CajaGrupoComponent;
  let fixture: ComponentFixture<CajaGrupoComponent>;
  let mockStateService: MockCajasStateService;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    mockStateService = createMockCajasStateService();
    mockRouter = createMockRouter();

    await TestBed.configureTestingModule({
      imports: [CajaGrupoComponent],
      providers: [
        { provide: CajasStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CajaGrupoComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should inject dependencies correctly', () => {
      expect(component.cajaGrupo).toBe(mockStateService.cajaGrupo);
      expect(component.saldoGrupo).toBe(mockStateService.saldoGrupo);
      // Router injection tested implicitly through navigation tests
    });

    it('should call loadCajaGrupo on ngOnInit', () => {
      component.ngOnInit();
      expect(mockStateService.loadCajaGrupo).toHaveBeenCalledTimes(1);
    });

    it('should call loadMovimientosGrupo on ngOnInit', () => {
      component.ngOnInit();
      expect(mockStateService.loadMovimientosGrupo).toHaveBeenCalledTimes(1);
    });
  });

  describe('Caja Grupo Signal Handling', () => {
    it('should expose cajaGrupo signal from state service', () => {
      const mockCaja = createMockCajaConSaldo({ saldo: 1000 });

      mockStateService.cajaGrupo.set(mockCaja);

      // Direct signal read - no change detection needed
      expect(component.cajaGrupo()).toEqual(mockCaja);
      expect(component.cajaGrupo()?.saldo).toBe(1000);
    });

    it('should expose saldoGrupo signal from state service', () => {
      mockStateService.saldoGrupo.set(1500);

      expect(component.saldoGrupo()).toBe(1500);
    });

    it('should update cajaGrupo when state service signal changes', () => {
      const caja1 = createMockCajaConSaldo({ saldo: 1000 });
      const caja2 = createMockCajaConSaldo({ saldo: 2000 });

      mockStateService.cajaGrupo.set(caja1);
      expect(component.cajaGrupo()?.saldo).toBe(1000);

      mockStateService.cajaGrupo.set(caja2);
      expect(component.cajaGrupo()?.saldo).toBe(2000);
    });

    it('should handle null cajaGrupo', () => {
      mockStateService.cajaGrupo.set(null);

      expect(component.cajaGrupo()).toBeNull();
    });
  });

  describe('Movimientos Signal Handling', () => {
    it('should expose movimientosGrupo signal from state service', () => {
      const mockMovimientos: Movimiento[] = [
        createMockMovimiento({ id: '1', monto: 100 }),
        createMockMovimiento({ id: '2', monto: -50 }),
      ];

      mockStateService.movimientosGrupo.set(mockMovimientos);

      const result = component.movimientosGrupo();

      expect(result).toEqual(mockMovimientos);
      expect(result.length).toBe(2);
    });

    it('should handle empty movimientos list', () => {
      mockStateService.movimientosGrupo.set([]);

      expect(component.movimientosGrupo().length).toBe(0);
    });

    it('should update movimientos when state changes', () => {
      const m1: Movimiento[] = [createMockMovimiento({ id: '1', monto: 100 })];
      const m2: Movimiento[] = [
        createMockMovimiento({ id: '1', monto: 100 }),
        createMockMovimiento({ id: '2', monto: 50 }),
      ];

      mockStateService.movimientosGrupo.set(m1);
      expect(component.movimientosGrupo().length).toBe(1);

      mockStateService.movimientosGrupo.set(m2);
      expect(component.movimientosGrupo().length).toBe(2);
    });
  });

  describe('Loading and Error States', () => {
    it('should expose loading signal from state service', () => {
      mockStateService.loading.set(true);
      expect(component.loading()).toBe(true);

      mockStateService.loading.set(false);
      expect(component.loading()).toBe(false);
    });

    it('should expose error signal from state service', () => {
      const errorMsg = 'Failed to load caja grupo';
      mockStateService.error.set(errorMsg);

      expect(component.error()).toBe(errorMsg);
    });

    it('should handle loading state', () => {
      mockStateService.loading.set(true);

      expect(component.loading()).toBe(true);
      expect(component.error()).toBeNull();
    });

    it('should handle error state', () => {
      const errorMsg = 'Network error';
      mockStateService.error.set(errorMsg);

      expect(component.error()).toBe(errorMsg);
      expect(component.loading()).toBe(false);
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate to movimientos with caja filter on onVerTodosMovimientos', () => {
      component.onVerTodosMovimientos();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos'], {
        queryParams: { caja: 'grupo' },
      });
    });

    it('should navigate to nuevo movimiento with cajaId on onRegistrarMovimiento', () => {
      const mockCaja = createMockCajaConSaldo({ id: 'caja-123', saldo: 1000 });

      mockStateService.cajaGrupo.set(mockCaja);

      component.onRegistrarMovimiento();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos/nuevo'], {
        queryParams: { cajaId: 'caja-123' },
      });
    });

    it('should navigate to movimiento detail on onVerMovimiento', () => {
      const movimientoId = 'mov-456';

      component.onVerMovimiento(movimientoId);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos', 'mov-456']);
    });

    it('should not navigate on onRegistrarMovimiento when caja is null', () => {
      mockStateService.cajaGrupo.set(null);

      component.onRegistrarMovimiento();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should load data on initialization', () => {
      component.ngOnInit();

      expect(mockStateService.loadCajaGrupo).toHaveBeenCalled();
      expect(mockStateService.loadMovimientosGrupo).toHaveBeenCalled();
    });

    it('should maintain state signals throughout lifecycle', () => {
      const mockCaja = createMockCajaConSaldo({ saldo: 1000 });

      mockStateService.cajaGrupo.set(mockCaja);
      const caja1 = component.cajaGrupo();

      mockStateService.cajaGrupo.set(mockCaja);
      const caja2 = component.cajaGrupo();

      expect(caja1).toEqual(caja2);
    });
  });
});
