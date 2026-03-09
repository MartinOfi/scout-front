/**
 * FondosRamaComponent Tests
 * Tests smart component behavior for fondos rama view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

import { FondosRamaComponent } from './fondos-rama.component';
import { CajasStateService } from '../../services/cajas-state.service';
import { RamaEnum } from '../../../../shared/enums';
import { CajaConSaldo } from '../../../../shared/models';
import { MockRouter } from '../../../../shared/testing/common-mocks';
import { MockCajasStateService } from '../../testing/cajas-test-utils';

describe('FondosRamaComponent', () => {
  let component: FondosRamaComponent;
  let fixture: ComponentFixture<FondosRamaComponent>;
  let mockStateService: MockCajasStateService;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    mockRouter = {
      navigate: () => Promise.resolve(true),
      navigateByUrl: () => Promise.resolve(true),
    };

    mockStateService = {
      cajaGrupo: signal(null),
      cajasRama: signal<Record<string, CajaConSaldo>>({}),
      movimientosGrupo: signal([]),
      movimientosRama: signal({}),
      saldoGrupo: signal(0),
      loading: signal(false),
      error: signal(null),
      loadCajaGrupo: () => {},
      loadCajaRama: () => {},
      loadTodasCajasRama: () => {},
      loadMovimientosGrupo: () => {},
      loadMovimientosRama: () => {},
      loadMovimientosPersonal: () => {},
    } as any;

    await TestBed.configureTestingModule({
      imports: [FondosRamaComponent],
      providers: [
        { provide: CajasStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FondosRamaComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should inject dependencies correctly', () => {
      expect(component.cajasRama).toBe(mockStateService.cajasRama);
      expect(component['router']).toBe(mockRouter);
    });

    it('should call loadTodasCajasRama on ngOnInit', () => {
      component.ngOnInit();
      expect(mockStateService.loadTodasCajasRama).toHaveBeenCalledTimes(1);
    });

    it('should have ramas array initialized', () => {
      expect(component.ramas).toHaveLength(4);
      expect(component.ramas).toContain(RamaEnum.MANADA);
      expect(component.ramas).toContain(RamaEnum.UNIDAD);
      expect(component.ramas).toContain(RamaEnum.CAMINANTES);
      expect(component.ramas).toContain(RamaEnum.ROVERS);
    });
  });

  describe('Cajas Rama Signal Handling', () => {
    it('should expose cajasRama signal from state service', () => {
      const mockCajas: Record<string, CajaConSaldo> = {
        [RamaEnum.MANADA]: { id: '1', saldo: 1000 } as any,
        [RamaEnum.UNIDAD]: { id: '2', saldo: 2000 } as any,
      };

      mockStateService.cajasRama.set(mockCajas);
      TestBed.flushEffects();

      expect(component.cajasRama()).toEqual(mockCajas);
    });

    it('should update cajasRama when state service signal changes', () => {
      const caja1: Record<string, CajaConSaldo> = {
        [RamaEnum.MANADA]: { id: '1', saldo: 1000 } as any,
      };

      const caja2: Record<string, CajaConSaldo> = {
        [RamaEnum.MANADA]: { id: '1', saldo: 1500 } as any,
        [RamaEnum.UNIDAD]: { id: '2', saldo: 2000 } as any,
      };

      mockStateService.cajasRama.set(caja1);
      TestBed.flushEffects();
      expect(Object.keys(component.cajasRama()).length).toBe(1);

      mockStateService.cajasRama.set(caja2);
      TestBed.flushEffects();
      expect(Object.keys(component.cajasRama()).length).toBe(2);
    });

    it('should handle empty cajasRama', () => {
      mockStateService.cajasRama.set({});
      TestBed.flushEffects();

      expect(Object.keys(component.cajasRama()).length).toBe(0);
    });
  });

  describe('Saldo Computations', () => {
    it('should expose saldoManada signal', () => {
      mockStateService.saldoManada.set(5000);
      TestBed.flushEffects();

      expect(component.saldoManada()).toBe(5000);
    });

    it('should expose saldoUnidad signal', () => {
      mockStateService.saldoUnidad.set(3000);
      TestBed.flushEffects();

      expect(component.saldoUnidad()).toBe(3000);
    });

    it('should expose saldoCaminantes signal', () => {
      mockStateService.saldoCaminantes.set(2000);
      TestBed.flushEffects();

      expect(component.saldoCaminantes()).toBe(2000);
    });

    it('should expose saldoRovers signal', () => {
      mockStateService.saldoRovers.set(1500);
      TestBed.flushEffects();

      expect(component.saldoRovers()).toBe(1500);
    });

    it('should expose totalSaldosRamas signal', () => {
      mockStateService.totalSaldosRamas.set(11500);
      TestBed.flushEffects();

      expect(component.totalSaldosRamas()).toBe(11500);
    });
  });

  describe('getSaldoRama Method', () => {
    it('should return saldo for existing rama', () => {
      const mockCajas: Record<string, CajaConSaldo> = {
        [RamaEnum.MANADA]: { id: '1', saldo: 1000 } as any,
      };

      mockStateService.cajasRama.set(mockCajas);
      TestBed.flushEffects();

      expect(component.getSaldoRama(RamaEnum.MANADA)).toBe(1000);
    });

    it('should return 0 for non-existing rama', () => {
      mockStateService.cajasRama.set({});
      TestBed.flushEffects();

      expect(component.getSaldoRama(RamaEnum.MANADA)).toBe(0);
    });

    it('should return 0 when caja is null', () => {
      const mockCajas: Record<string, CajaConSaldo> = {
        [RamaEnum.MANADA]: null as any,
      };

      mockStateService.cajasRama.set(mockCajas);
      TestBed.flushEffects();

      expect(component.getSaldoRama(RamaEnum.MANADA)).toBe(0);
    });
  });

  describe('getRamaIcon Method', () => {
    it('should return correct icon for each rama', () => {
      expect(component.getRamaIcon(RamaEnum.MANADA)).toBe('pets');
      expect(component.getRamaIcon(RamaEnum.UNIDAD)).toBe('groups');
      expect(component.getRamaIcon(RamaEnum.CAMINANTES)).toBe('hiking');
      expect(component.getRamaIcon(RamaEnum.ROVERS)).toBe('terrain');
    });

    it('should return default icon for unknown rama', () => {
      const unknownRama = 'UNKNOWN'
      expect(component.getRamaIcon(unknownRama)).toBe('account_balance');
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate to movimientos with rama filter on onVerMovimientosRama', () => {
      component.onVerMovimientosRama(RamaEnum.MANADA);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos'], {
        queryParams: { rama: RamaEnum.MANADA },
      });
    });

    it('should navigate to nuevo movimiento with cajaId on onRegistrarMovimiento', () => {
      const mockCajas: Record<string, CajaConSaldo> = {
        [RamaEnum.MANADA]: { id: 'caja-123', saldo: 1000 } as any,
      };

      mockStateService.cajasRama.set(mockCajas);

      component.onRegistrarMovimiento(RamaEnum.MANADA);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos/nuevo'], {
        queryParams: { cajaId: 'caja-123' },
      });
    });

    it('should not navigate on onRegistrarMovimiento when caja does not exist', () => {
      mockStateService.cajasRama.set({});

      component.onRegistrarMovimiento(RamaEnum.MANADA);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to different ramas', () => {
      const ramas = [RamaEnum.MANADA, RamaEnum.UNIDAD, RamaEnum.CAMINANTES, RamaEnum.ROVERS];

      ramas.forEach((rama) => {
        mockRouter.navigate.mockClear();
        component.onVerMovimientosRama(rama);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos'], {
          queryParams: { rama },
        });
      });
    });
  });

  describe('Loading States', () => {
    it('should expose loading signal from state service', () => {
      mockStateService.loading.set(true);
      TestBed.flushEffects();
      expect(component.loading()).toBe(true);

      mockStateService.loading.set(false);
      TestBed.flushEffects();
      expect(component.loading()).toBe(false);
    });

    it('should handle loading state transitions', () => {
      mockStateService.loading.set(true);
      TestBed.flushEffects();
      expect(component.loading()).toBe(true);

      mockStateService.loading.set(false);
      TestBed.flushEffects();
      expect(component.loading()).toBe(false);
    });
  });
});
