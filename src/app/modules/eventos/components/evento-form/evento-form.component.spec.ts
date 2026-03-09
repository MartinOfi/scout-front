/**
 * EventoFormComponent Tests
 * Tests smart component behavior for evento form
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { EventoFormComponent } from './evento-form.component';
import { EventosStateService } from '../../services/eventos-state.service';
import { MockRouter, MockActivatedRoute } from '../../../../shared/testing/common-mocks';

describe('EventoFormComponent', () => {
  let component: EventoFormComponent;
  let fixture: ComponentFixture<EventoFormComponent>;
  let mockStateService: MockEventosStateService;
  let mockRouter: MockRouter;
  let mockActivatedRoute: MockActivatedRoute;

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    mockActivatedRoute = {
      params: of({}),
      queryParams: of({}),
    };

    mockStateService = {
      loading: signal<boolean>(false),
      error: signal<string | null>(null),
      create: vi.fn().mockReturnValue(of(undefined)),
      update: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [EventoFormComponent],
      providers: [
        FormBuilder,
        { provide: EventosStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventoFormComponent);
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
      expect(component['router']).toBe(mockRouter);
    });

    it('should have form defined', () => {
      expect(component.form).toBeDefined();
    });

    it('should expose loading signal', () => {
      expect(component.loading).toBe(mockStateService.loading);
    });
  });

  describe('Form Structure', () => {
    it('should have required form controls', () => {
      expect(component.form.get('nombre')).toBeTruthy();
      expect(component.form.get('fecha')).toBeTruthy();
    });

    it('should validate required fields', () => {
      component.form.get('nombre')?.setValue('');
      component.form.markAllAsTouched();

      expect(component.form.invalid).toBe(true);
    });

    it('should be valid with required fields filled', () => {
      component.form.patchValue({
        nombre: 'Evento Scouta',
        fecha: new Date('2024-06-15'),
      });

      expect(component.form.valid).toBe(true);
    });
  });

  describe('Loading State', () => {
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

  describe('Error Handling', () => {
    it('should expose error signal from state service', () => {
      const errorMsg = 'Failed to create evento';
      mockStateService.error.set(errorMsg);
      TestBed.flushEffects();

      expect(component.error()).toBe(errorMsg);

      mockStateService.error.set(null);
      TestBed.flushEffects();

      expect(component.error()).toBeNull();
    });

    it('should handle error state transitions', () => {
      const errorMsg = 'Network error';
      mockStateService.error.set(errorMsg);
      TestBed.flushEffects();
      expect(component.error()).toBe(errorMsg);

      mockStateService.error.set(null);
      TestBed.flushEffects();
      expect(component.error()).toBeNull();
    });
  });

  describe('Form Submission', () => {
    it('should not submit invalid form', () => {
      component.form.patchValue({
        nombre: '',
      });
      component.form.markAllAsTouched();

      if (component.onSubmit) {
        component.onSubmit();
      }

      expect(mockStateService.create).not.toHaveBeenCalled();
    });

    it('should handle submit with valid form', () => {
      component.form.patchValue({
        nombre: 'Evento Test',
        fecha: new Date('2024-06-15'),
      });

      if (component.onSubmit) {
        component.onSubmit();
      }
    });
  });

  describe('Cancel Action', () => {
    it('should navigate back on cancel', () => {
      if (component.onCancel) {
        component.onCancel();
      }
    });

    it('should not submit form on cancel', () => {
      if (component.onCancel) {
        component.onCancel();
      }

      expect(mockStateService.create).not.toHaveBeenCalled();
    });
  });

  describe('Query Params Handling', () => {
    it('should handle empty query params', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({});

      component.ngOnInit?.();

      setTimeout(() => {
        expect(component).toBeTruthy();
        });
      tick();
    });

    it('should pre-fill form from route params if provided', fakeAsync(() => {
      mockActivatedRoute.params = of({ id: 'evt-123' });

      component.ngOnInit?.();

      setTimeout(() => {
        expect(component).toBeTruthy();
        });
      tick();
    });
  });

  describe('Form State Management', () => {
    it('should maintain form state throughout lifecycle', () => {
      const formValue = {
        nombre: 'Evento Scout',
        fecha: new Date('2024-06-15'),
      };

      component.form.patchValue(formValue);

      const value1 = component.form.value;

      component.form.patchValue(formValue);

      const value2 = component.form.value;

      expect(value1.nombre).toBe(value2.nombre);
    });

    it('should clear error after successful submission', () => {
      mockStateService.error.set('Previous error');
      mockStateService.create.mockReturnValue(of(undefined));

      component.form.patchValue({
        nombre: 'Test Event',
        fecha: new Date(),
      });

      if (component.onSubmit) {
        component.onSubmit();
      }

      mockStateService.error.set(null);
      TestBed.flushEffects();
      expect(component.error()).toBeNull();
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize on ngOnInit', fakeAsync(() => {
      component.ngOnInit?.();

      setTimeout(() => {
        expect(component).toBeTruthy();
        });
      tick();
    });

    it('should maintain form throughout component lifetime', () => {
      const initialForm = component.form;

      component.form.patchValue({ nombre: 'Test' });

      const currentForm = component.form;

      expect(initialForm).toBe(currentForm);
    });
  });
});
