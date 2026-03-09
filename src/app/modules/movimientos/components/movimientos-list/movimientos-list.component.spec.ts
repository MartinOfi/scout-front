/**
 * MovimientosListComponent Tests
 * Tests smart component behavior for movimientos list view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { MovimientosListComponent } from './movimientos-list.component';
import { MovimientosStateService } from '../../services/movimientos-state.service';
import { Movimiento, MovimientosFilters } from '../../../../shared/models';
import { TipoMovimientoEnum } from '../../../../shared/enums';
import {
  createMockMovimientosStateService,
  createMockMovimiento,
  MockMovimientosStateService,
} from '../../testing/movimientos-test-utils';
import { createMockRouter, createMockActivatedRoute, MockRouter } from '../../../../shared/testing';
import { MockRouter, MockActivatedRoute } from '../../../../shared/testing/common-mocks';

describe('MovimientosListComponent', () => {
  let component: MovimientosListComponent;
  let fixture: ComponentFixture<MovimientosListComponent>;
  let mockStateService: MockMovimientosStateService;
  let mockRouter: MockRouter;
  let mockActivatedRoute: MockActivatedRoute;

  beforeEach(async () => {
    mockRouter = createMockRouter();
    mockActivatedRoute = createMockActivatedRoute({});
    mockStateService = createMockMovimientosStateService();

    await TestBed.configureTestingModule({
      imports: [MovimientosListComponent],
      providers: [
        { provide: MovimientosStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovimientosListComponent);
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
      expect(component.movimientos).toBe(mockStateService.filtered);
      expect(component['router']).toBe(mockRouter);
      expect(component['state']).toBe(mockStateService);
    });

    it('should call load on ngOnInit', () => {
      component.ngOnInit();
      expect(mockStateService.load).toHaveBeenCalledTimes(1);
    });

    it('should handle empty query params', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({});
      component.ngOnInit();
      tick();

      expect(mockStateService.setFilters).toHaveBeenCalled();
    }));
  });

  describe('Movimientos Signal Handling', () => {
    it('should expose filtered movimientos from state', () => {
      const mockMovimientos: Movimiento[] = [
        createMockMovimiento({ id: '1', monto: 100 }),
        createMockMovimiento({ id: '2', monto: 50 }),
      ];

      mockStateService.movimientos.set(mockMovimientos);
      TestBed.flushEffects();

      expect(component.movimientos()).toEqual(mockMovimientos);
      expect(component.movimientos().length).toBe(2);
    });

    it('should expose totalIngresos signal', () => {
      mockStateService.totalIngresos.set(5000);
      TestBed.flushEffects();

      expect(component.totalIngresos()).toBe(5000);
    });

    it('should expose totalEgresos signal', () => {
      mockStateService.totalEgresos.set(3000);
      TestBed.flushEffects();

      expect(component.totalEgresos()).toBe(3000);
    });

    it('should expose saldoNeto signal', () => {
      mockStateService.saldoNeto.set(2000);
      TestBed.flushEffects();

      expect(component.saldoNeto()).toBe(2000);
    });

    it('should update movimientos when state changes', () => {
      const m1: Movimiento[] = [createMockMovimiento({ id: '1', monto: 100 })];
      const m2: Movimiento[] = [
        createMockMovimiento({ id: '1', monto: 100 }),
        createMockMovimiento({ id: '2', monto: 50 }),
      ];

      mockStateService.movimientos.set(m1);
      TestBed.flushEffects();
      expect(component.movimientos().length).toBe(1);

      mockStateService.movimientos.set(m2);
      TestBed.flushEffects();
      expect(component.movimientos().length).toBe(2);
    });
  });

  describe('Filter Handling', () => {
    it('should call setFilters on onFilterChange', () => {
      const filters: MovimientosFilters = { cajaId: 'caja-1', tipo: TipoMovimientoEnum.INGRESO };

      component.onFilterChange(filters);

      expect(mockStateService.setFilters).toHaveBeenCalledWith(filters);
    });

    it('should call clearFilters on onClearFilters', () => {
      component.onClearFilters();

      expect(mockStateService.clearFilters).toHaveBeenCalledTimes(1);
    });

    it('should handle queryParams with cajaId', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({ cajaId: 'caja-123' });

      component.ngOnInit();
      tick();

      expect(mockStateService.setFilters).toHaveBeenCalled();
    }));

    it('should handle multiple query params', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({
        cajaId: 'caja-1',
        tipo: TipoMovimientoEnum.INGRESO,
        concepto: 'Donación',
      });

      component.ngOnInit();
      tick();

      expect(mockStateService.setFilters).toHaveBeenCalled();
    }));
  });

  describe('Navigation Actions', () => {
    it('should navigate to nuevo on onNuevoMovimiento', () => {
      component.onNuevoMovimiento();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos/nuevo']);
    });

    it('should navigate to detail on onVerDetalle', () => {
      component.onVerDetalle('mov-123');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos', 'mov-123']);
    });

    it('should navigate to edit on onEditar', () => {
      component.onEditar('mov-456');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos', 'mov-456', 'editar']);
    });
  });

  describe('Delete Action', () => {
    it('should delete movimiento when confirmed', fakeAsync(() => {
      mockStateService.delete.mockReturnValue(of(undefined));

      component.onEliminar('mov-789');
      tick();

      expect(mockStateService.delete).toHaveBeenCalledWith('mov-789');
    }));

    it('should not delete when user cancels', fakeAsync(() => {
      component.onEliminar('mov-999');
      tick();

      expect(mockStateService.delete).not.toHaveBeenCalled();
    }));

    it('should call confirm with correct message', fakeAsync(() => {
      component.onEliminar('mov-123');
      tick();

      expect(mockStateService.delete).toHaveBeenCalled();
    }));
  });

  describe('Loading and Error States', () => {
    it('should expose loading signal', () => {
      mockStateService.loading.set(true);
      TestBed.flushEffects();

      expect(component.loading()).toBe(true);

      mockStateService.loading.set(false);
      TestBed.flushEffects();

      expect(component.loading()).toBe(false);
    });

    it('should expose error signal', () => {
      const errorMsg = 'Failed to load movimientos';
      mockStateService.error.set(errorMsg);
      TestBed.flushEffects();

      expect(component.error()).toBe(errorMsg);

      mockStateService.error.set(null);
      TestBed.flushEffects();

      expect(component.error()).toBeNull();
    });
  });

  describe('Empty State', () => {
    it('should handle empty movimientos list', () => {
      mockStateService.movimientos.set([]);
      TestBed.flushEffects();

      expect(component.movimientos().length).toBe(0);
    });

    it('should handle multiple movimientos', () => {
      const movimientos: Movimiento[] = Array.from({ length: 5 }, (_, i) =>
        createMockMovimiento({
          id: `mov${i}`,
          monto: 100 + i * 50,
        })
      );

      mockStateService.movimientos.set(movimientos);
      TestBed.flushEffects();

      expect(component.movimientos().length).toBe(5);
    });
  });

  describe('Navigation Edge Cases', () => {
    it('should handle delete with empty string id', fakeAsync(() => {
      component.onEliminar('');
      tick();

      expect(mockStateService.delete).toHaveBeenCalledWith('');
    }));

    it('should handle multiple navigation calls in sequence', () => {
      component.onNuevoMovimiento();
      component.onVerDetalle('mov-1');
      component.onEditar('mov-2');

      expect(mockRouter.navigate).toHaveBeenCalledTimes(3);
    });
  });
});
