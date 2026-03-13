/**
 * FondosRamaComponent Tests
 * Tests smart component behavior for fondos rama view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';

import { FondosRamaComponent } from './fondos-rama.component';
import { CajasStateService } from '../../services/cajas-state.service';
import { Rama, RamaEnum, CajaType } from '../../../../shared/enums';
import { CajaConSaldo } from '../../../../shared/models';

describe('FondosRamaComponent', () => {
  let component: FondosRamaComponent;
  let fixture: ComponentFixture<FondosRamaComponent>;
  let cajasRamaSignal: WritableSignal<Record<string, CajaConSaldo>>;
  let loadingSignal: WritableSignal<boolean>;
  let mockStateService: Partial<CajasStateService>;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  function createMockCajaConSaldo(overrides: Partial<CajaConSaldo> = {}): CajaConSaldo {
    return {
      id: 'caja-1',
      tipo: CajaType.GRUPO,
      saldoActual: 1000,
      nombre: null,
      propietarioId: null,
      propietario: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    cajasRamaSignal = signal<Record<string, CajaConSaldo>>({});
    loadingSignal = signal<boolean>(false);

    mockStateService = {
      cajasRama: cajasRamaSignal,
      saldoManada: signal(0),
      saldoUnidad: signal(0),
      saldoCaminantes: signal(0),
      saldoRovers: signal(0),
      totalSaldosRamas: signal(0),
      loading: loadingSignal,
      loadTodasCajasRama: vi.fn(),
      selectCaja: vi.fn(),
    };

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
    it('should read cajasRama from state service signal', () => {
      const mockCajas: Record<string, CajaConSaldo> = {
        [RamaEnum.MANADA]: createMockCajaConSaldo({ id: '1', saldoActual: 1000 }),
        [RamaEnum.UNIDAD]: createMockCajaConSaldo({ id: '2', saldoActual: 2000 }),
      };

      cajasRamaSignal.set(mockCajas);

      expect(component.cajasRama()).toEqual(mockCajas);
    });

    it('should update when cajasRama signal changes', () => {
      const caja1: Record<string, CajaConSaldo> = {
        [RamaEnum.MANADA]: createMockCajaConSaldo({ id: '1', saldoActual: 1000 }),
      };

      cajasRamaSignal.set(caja1);
      expect(Object.keys(component.cajasRama()).length).toBe(1);

      const caja2: Record<string, CajaConSaldo> = {
        [RamaEnum.MANADA]: createMockCajaConSaldo({ id: '1', saldoActual: 1500 }),
        [RamaEnum.UNIDAD]: createMockCajaConSaldo({ id: '2', saldoActual: 2000 }),
      };

      cajasRamaSignal.set(caja2);
      expect(Object.keys(component.cajasRama()).length).toBe(2);
    });

    it('should handle empty cajasRama', () => {
      cajasRamaSignal.set({});
      expect(Object.keys(component.cajasRama()).length).toBe(0);
    });
  });

  describe('getSaldoRama Method', () => {
    it('should return saldo for existing rama', () => {
      const mockCajas: Record<string, CajaConSaldo> = {
        [RamaEnum.MANADA]: createMockCajaConSaldo({ id: '1', saldoActual: 1000 }),
      };

      cajasRamaSignal.set(mockCajas);

      expect(component.getSaldoRama(RamaEnum.MANADA)).toBe(1000);
    });

    it('should return 0 for non-existing rama', () => {
      cajasRamaSignal.set({});
      expect(component.getSaldoRama(RamaEnum.MANADA)).toBe(0);
    });

    it('should return 0 when caja is null', () => {
      const mockCajas: Record<string, CajaConSaldo> = {
        [RamaEnum.MANADA]: null as unknown as CajaConSaldo,
      };

      cajasRamaSignal.set(mockCajas);
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
        [RamaEnum.MANADA]: createMockCajaConSaldo({ id: 'caja-123', saldoActual: 1000 }),
      };

      cajasRamaSignal.set(mockCajas);

      component.onRegistrarMovimiento(RamaEnum.MANADA);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos/nuevo'], {
        queryParams: { cajaId: 'caja-123' },
      });
    });

    it('should not navigate on onRegistrarMovimiento when caja does not exist', () => {
      cajasRamaSignal.set({});

      component.onRegistrarMovimiento(RamaEnum.MANADA);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to different ramas', () => {
      const ramas: Rama[] = [
        RamaEnum.MANADA,
        RamaEnum.UNIDAD,
        RamaEnum.CAMINANTES,
        RamaEnum.ROVERS,
      ];

      ramas.forEach((rama, index) => {
        component.onVerMovimientosRama(rama);

        expect(mockRouter.navigate).toHaveBeenNthCalledWith(index + 1, ['/movimientos'], {
          queryParams: { rama },
        });
      });
    });
  });

  describe('Loading States', () => {
    it('should read loading from state service signal', () => {
      loadingSignal.set(true);
      expect(component.loading()).toBe(true);

      loadingSignal.set(false);
      expect(component.loading()).toBe(false);
    });
  });

  describe('onOpenDrawer Method', () => {
    it('should call selectCaja when caja exists', () => {
      const mockCaja = createMockCajaConSaldo({ id: 'caja-manada', saldoActual: 1000 });
      const mockCajas: Record<string, CajaConSaldo> = {
        [RamaEnum.MANADA]: mockCaja,
      };

      cajasRamaSignal.set(mockCajas);

      component.onOpenDrawer(RamaEnum.MANADA);

      expect(mockStateService.selectCaja).toHaveBeenCalledTimes(1);
      expect(mockStateService.selectCaja).toHaveBeenCalledWith(mockCaja);
    });

    it('should not call selectCaja when caja does not exist', () => {
      cajasRamaSignal.set({});

      component.onOpenDrawer(RamaEnum.MANADA);

      expect(mockStateService.selectCaja).not.toHaveBeenCalled();
    });
  });
});
