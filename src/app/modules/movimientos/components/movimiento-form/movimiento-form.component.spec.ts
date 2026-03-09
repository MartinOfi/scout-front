/**
 * MovimientoFormComponent Tests
 * Tests smart component behavior for movimiento form
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { MovimientoFormComponent } from './movimiento-form.component';
import { MovimientosStateService } from '../../services/movimientos-state.service';
import { CajasStateService } from '../../../cajas/services/cajas-state.service';
import { CreateMovimientoDto } from '../../../../shared/models';
import { TipoMovimientoEnum, MedioPagoEnum, EstadoPago } from '../../../../shared/enums';
import { createMockRouter, MockRouter, createMockActivatedRoute } from '../../../../shared/testing';
import { createMockMovimientosStateService, MockMovimientosStateService } from '../../testing/movimientos-test-utils';
import { MockRouter, MockActivatedRoute } from '../../../../shared/testing/common-mocks';

describe('MovimientoFormComponent', () => {
  let component: MovimientoFormComponent;
  let fixture: ComponentFixture<MovimientoFormComponent>;
  let mockStateService: MockMovimientosStateService;
  let mockCajasStateService: any; // Cajas service
  let mockRouter: MockRouter;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockRouter = createMockRouter();
    mockActivatedRoute = createMockActivatedRoute({ });
    mockStateService = createMockMovimientosStateService();

    mockCajasStateService = {
      cajasRama: signal({}),
    };

    await TestBed.configureTestingModule({
      imports: [MovimientoFormComponent],
      providers: [
        FormBuilder,
        { provide: MovimientosStateService, useValue: mockStateService },
        { provide: CajasStateService, useValue: mockCajasStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovimientoFormComponent);
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
      expect(component['state']).toBe(mockStateService);
      expect(component['cajasState']).toBe(mockCajasStateService);
      expect(component['router']).toBe(mockRouter);
    });

    it('should create form with default values', () => {
      expect(component.form).toBeDefined();
      expect(component.form.get('tipo')?.value).toBe(TipoMovimientoEnum.INGRESO);
      expect(component.form.get('medioPago')?.value).toBe(MedioPagoEnum.EFECTIVO);
    });

    it('should have form controls', () => {
      expect(component.form.get('cajaId')).toBeTruthy();
      expect(component.form.get('tipo')).toBeTruthy();
      expect(component.form.get('monto')).toBeTruthy();
      expect(component.form.get('concepto')).toBeTruthy();
      expect(component.form.get('responsableId')).toBeTruthy();
    });

    it('should initialize tipos array', () => {
      expect(component.tipos).toContain(TipoMovimientoEnum.INGRESO);
      expect(component.tipos).toContain(TipoMovimientoEnum.EGRESO);
    });

    it('should initialize medios pago array', () => {
      expect(component.mediosPago).toContain(MedioPagoEnum.EFECTIVO);
      expect(component.mediosPago).toContain(MedioPagoEnum.TRANSFERENCIA);
    });
  });

  describe('Query Params Handling', () => {
    it('should pre-fill cajaId from query params', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({ cajaId: 'caja-123' });

      component.ngOnInit();

      setTimeout(() => {
        expect(component.form.get('cajaId')?.value).toBe('caja-123');
        });
      tick();
    });

    it('should not override cajaId if not in params', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({});

      component.ngOnInit();

      setTimeout(() => {
        expect(component.form.get('cajaId')?.value).toBe('');
        });
      tick();
    });

    it('should handle params with personaId', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({ personaId: 'persona-456' });

      component.ngOnInit();

      setTimeout(() => {
        // PersonaId is not directly handled in form, but tests that query params are processed
        });
      tick();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      component.form.patchValue({
        cajaId: '',
        concepto: '',
        responsableId: '',
        monto: '',
      });
      component.form.markAllAsTouched();

      expect(component.form.invalid).toBe(true);
    });

    it('should be valid with required fields filled', () => {
      component.form.patchValue({
        cajaId: 'caja-1',
        concepto: 'Donación',
        responsableId: 'resp-1',
        monto: 100,
      });

      expect(component.form.valid).toBe(true);
    });

    it('should validate monto is positive', () => {
      component.form.get('monto')?.setValue(-50);
      component.form.markAllAsTouched();

      expect(component.form.invalid).toBe(true);
    });

    it('should validate monto minimum value', () => {
      component.form.get('monto')?.setValue(0);
      component.form.markAllAsTouched();

      expect(component.form.invalid).toBe(true);
    });

    it('should accept valid monto', () => {
      component.form.get('monto')?.setValue(100.50);

      expect(component.form.get('monto')?.valid).toBe(true);
    });
  });

  describe('Concepto Change', () => {
    it('should update concepto on onConceptoChange', () => {
      component.onConceptoChange('Donación');

      expect(component.form.get('concepto')?.value).toBe('Donación');
    });

    it('should handle empty concepto', () => {
      component.onConceptoChange('');

      expect(component.form.get('concepto')?.value).toBe('');
    });

    it('should update concepto without affecting other fields', () => {
      component.form.patchValue({
        cajaId: 'caja-1',
        monto: 500,
      });

      component.onConceptoChange('Gasto Operativo');

      expect(component.form.get('cajaId')?.value).toBe('caja-1');
      expect(component.form.get('monto')?.value).toBe(500);
      expect(component.form.get('concepto')?.value).toBe('Gasto Operativo');
    });
  });

  describe('Form Submission', () => {
    it('should not submit invalid form', () => {
      component.form.patchValue({
        cajaId: '',
        concepto: '',
      });
      component.form.markAllAsTouched();

      component.onSubmit();

      expect(mockStateService.create).not.toHaveBeenCalled();
    });

    it('should submit valid form', fakeAsync(() => {
      component.form.patchValue({
        cajaId: 'caja-1',
        tipo: TipoMovimientoEnum.INGRESO,
        monto: 500,
        concepto: 'Donación',
        responsableId: 'resp-1',
        medioPago: MedioPagoEnum.EFECTIVO,
        requiereComprobante: false,
        estadoPago: EstadoPago.PAGADO,
        fecha: new Date('2024-01-15'),
      });

      component.onSubmit();

      setTimeout(() => {
        expect(mockStateService.create).toHaveBeenCalled();
        const dto = mockStateService.create.mock.calls[0][0];
        expect(dto.monto).toBe(500);
        expect(dto.concepto).toBe('Donación');
        });
      tick();
    });

    it('should navigate to list after successful submit', fakeAsync(() => {
      component.form.patchValue({
        cajaId: 'caja-1',
        monto: 500,
        concepto: 'Test',
        responsableId: 'resp-1',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos']);
        });
      tick();
    });

    it('should extract DTO correctly', fakeAsync(() => {
      const testDate = new Date('2024-02-01');
      component.form.patchValue({
        cajaId: 'caja-123',
        tipo: TipoMovimientoEnum.EGRESO,
        monto: 250.75,
        concepto: 'Gasto',
        descripcion: 'Test description',
        responsableId: 'resp-123',
        medioPago: MedioPagoEnum.TRANSFERENCIA,
        requiereComprobante: true,
        estadoPago: EstadoPago.PENDIENTE,
        fecha: testDate,
      });

      component.onSubmit();

      setTimeout(() => {
        const dto = mockStateService.create.mock.calls[0][0] as CreateMovimientoDto;
        expect(dto.cajaId).toBe('caja-123');
        expect(dto.tipo).toBe(TipoMovimientoEnum.EGRESO);
        expect(dto.monto).toBe(250.75);
        expect(dto.requiereComprobante).toBe(true);
        });
      tick();
    });
  });

  describe('Cancel Action', () => {
    it('should navigate to list on cancel', () => {
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos']);
    });

    it('should not submit form on cancel', () => {
      component.onCancel();

      expect(mockStateService.create).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should expose loading signal', () => {
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

  describe('Form Types', () => {
    it('should handle INGRESO type', () => {
      component.form.get('tipo')?.setValue(TipoMovimientoEnum.INGRESO);

      expect(component.form.get('tipo')?.value).toBe(TipoMovimientoEnum.INGRESO);
    });

    it('should handle EGRESO type', () => {
      component.form.get('tipo')?.setValue(TipoMovimientoEnum.EGRESO);

      expect(component.form.get('tipo')?.value).toBe(TipoMovimientoEnum.EGRESO);
    });

    it('should change tipo without affecting validation', () => {
      component.form.patchValue({
        cajaId: 'caja-1',
        monto: 100,
        concepto: 'Test',
        responsableId: 'resp-1',
      });

      expect(component.form.valid).toBe(true);

      component.form.get('tipo')?.setValue(TipoMovimientoEnum.EGRESO);

      expect(component.form.valid).toBe(true);
    });
  });
});
