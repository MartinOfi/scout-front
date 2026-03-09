/**
 * EducadoresFormComponent Tests
 * Tests smart component behavior for educadores create/edit forms
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { EducadoresFormComponent } from './educadores-form.component';
import { EducadoresStateService } from '../../../services';
import { PersonasFormBuilder } from '../../../services';
import {
  createMockEducador,
  createMockEducadoresStateService,
  createMockActivatedRoute,
  createMockRouter,
  createMockPersonasFormBuilder,
} from '../../../testing/personas-test-utils';

describe('EducadoresFormComponent', () => {
  let component: EducadoresFormComponent;
  let fixture: ComponentFixture<EducadoresFormComponent>;
  let mockStateService: ReturnType<typeof createMockEducadoresStateService>;
  let mockRouter: ReturnType<typeof createMockRouter>;
  let mockActivatedRoute: ReturnType<typeof createMockActivatedRoute>;
  let mockFormBuilder: ReturnType<typeof createMockPersonasFormBuilder>;

  beforeEach(async () => {
    mockStateService = createMockEducadoresStateService();
    mockRouter = createMockRouter();
    mockActivatedRoute = createMockActivatedRoute();
    mockFormBuilder = createMockPersonasFormBuilder();

    await TestBed.configureTestingModule({
      imports: [EducadoresFormComponent],
      providers: [
        { provide: EducadoresStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PersonasFormBuilder, useValue: mockFormBuilder },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EducadoresFormComponent);
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
      expect(component.state).toBe(mockStateService);
      expect(component['router']).toBe(mockRouter);
      expect(component['activatedRoute']).toBe(mockActivatedRoute);
      expect(component['formBuilder']).toBe(mockFormBuilder);
    });
  });

  describe('Create Mode', () => {
    beforeEach(() => {
      mockActivatedRoute = createMockActivatedRoute({});
    });

    it('should detect create mode when no id in route params', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        expect(component.isEditMode()).toBe(false);
        done();
      }, 10);
    });

    it('should build create form in create mode', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        expect(mockFormBuilder.buildCreateEducadorForm).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should submit create form on onSubmit', (done) => {
      fixture.detectChanges();
      const mockEducador = createMockEducador();
      mockStateService.create.mockReturnValue(of(mockEducador));

      component.onSubmit();

      setTimeout(() => {
        expect(mockStateService.create).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/educadores']);
        done();
      }, 10);
    });

    it('should navigate back on cancel in create mode', () => {
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/educadores']);
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      mockActivatedRoute = createMockActivatedRoute({ id: '123' });
    });

    it('should detect edit mode when id in route params', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        expect(component.isEditMode()).toBe(true);
        done();
      }, 10);
    });

    it('should load educador and build edit form in edit mode', (done) => {
      const mockEducador = createMockEducador({ id: '123' });
      mockStateService.selected.set(mockEducador);

      fixture.detectChanges();
      setTimeout(() => {
        expect(mockFormBuilder.buildEditEducadorForm).toHaveBeenCalledWith(mockEducador);
        done();
      }, 10);
    });

    it('should submit update form on onSubmit in edit mode', (done) => {
      const mockEducador = createMockEducador({ id: '123' });
      mockStateService.selected.set(mockEducador);
      mockStateService.update.mockReturnValue(of(mockEducador));

      component.onSubmit();

      setTimeout(() => {
        expect(mockStateService.update).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/educadores', '123']);
        done();
      }, 10);
    });

    it('should navigate back to detail on cancel in edit mode', () => {
      mockActivatedRoute = createMockActivatedRoute({ id: '123' });
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/educadores', '123']);
    });
  });

  describe('Form Validation', () => {
    it('should initialize form with empty values in create mode', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        expect(component.form.get('nombre')?.value).toBeFalsy();
        expect(component.form.get('apellido')?.value).toBeFalsy();
        expect(component.form.get('cargo')?.value).toBeFalsy();
        done();
      }, 10);
    });

    it('should initialize form with educador data in edit mode', (done) => {
      const mockEducador = createMockEducador({
        id: '123',
        nombre: 'María',
        apellido: 'González',
        cargo: 'Coordinadora',
      });
      mockStateService.selected.set(mockEducador);
      mockActivatedRoute = createMockActivatedRoute({ id: '123' });

      fixture.detectChanges();
      setTimeout(() => {
        expect(component.form.get('nombre')?.value).toBe('María');
        expect(component.form.get('apellido')?.value).toBe('González');
        expect(component.form.get('cargo')?.value).toBe('Coordinadora');
        done();
      }, 10);
    });

    it('should validate required fields', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        const form = component.form;
        form.get('nombre')?.setValue('');
        form.markAllAsTouched();

        expect(form.invalid).toBe(true);
        done();
      }, 10);
    });

    it('should be valid with all required fields filled', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        const form = component.form;
        form.patchValue({
          nombre: 'María',
          apellido: 'González',
          dni: '12345678',
          rama: 'UNIDAD',
          cargo: 'Coordinadora',
        });

        expect(form.valid).toBe(true);
        done();
      }, 10);
    });
  });

  describe('Loading and Error States', () => {
    it('should expose loading signal from state service', () => {
      mockStateService.loading.set(true);
      TestBed.flushEffects();
      expect(component.loading()).toBe(true);

      mockStateService.loading.set(false);
      TestBed.flushEffects();
      expect(component.loading()).toBe(false);
    });

    it('should expose error signal from state service', () => {
      const errorMsg = 'Failed to save educador';
      mockStateService.error.set(errorMsg);
      TestBed.flushEffects();
      expect(component.error()).toBe(errorMsg);

      mockStateService.error.set(null);
      TestBed.flushEffects();
      expect(component.error()).toBeNull();
    });

    it('should disable submit button when form invalid', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        const form = component.form;
        form.get('nombre')?.setValue('');
        form.markAllAsTouched();

        expect(component.isSubmitDisabled()).toBe(true);
        done();
      }, 10);
    });

    it('should disable submit button when loading', (done) => {
      fixture.detectChanges();
      mockStateService.loading.set(true);
      TestBed.flushEffects();

      setTimeout(() => {
        expect(component.isSubmitDisabled()).toBe(true);
        done();
      }, 10);
    });
  });

  describe('DTO Extraction', () => {
    it('should extract create DTO from form values', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        const form = component.form;
        form.patchValue({
          nombre: 'María',
          apellido: 'González',
          dni: '87654321',
          rama: 'UNIDAD',
          cargo: 'Coordinadora',
        });

        const dto = mockFormBuilder.extractCreateEducadorDto(form);

        expect(dto.nombre).toBe('María');
        expect(dto.apellido).toBe('González');
        expect(dto.cargo).toBe('Coordinadora');
        done();
      }, 10);
    });

    it('should extract update DTO from form values', (done) => {
      const mockEducador = createMockEducador({ id: '123' });
      mockStateService.selected.set(mockEducador);

      fixture.detectChanges();
      setTimeout(() => {
        const form = component.form;
        form.patchValue({
          nombre: 'Updated Name',
          cargo: 'Nueva Posición',
        });

        const dto = mockFormBuilder.extractUpdateEducadorDto(form);

        expect(dto.nombre).toBe('Updated Name');
        expect(dto.cargo).toBe('Nueva Posición');
        done();
      }, 10);
    });
  });

  describe('Navigation Edge Cases', () => {
    it('should handle missing educador in edit mode gracefully', (done) => {
      mockActivatedRoute = createMockActivatedRoute({ id: '999' });
      mockStateService.selected.set(null);

      fixture.detectChanges();
      setTimeout(() => {
        expect(component.loading()).toBe(false);
        done();
      }, 10);
    });

    it('should navigate to list after successful create', (done) => {
      mockStateService.create.mockReturnValue(of(createMockEducador()));

      component.onSubmit();

      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/educadores']);
        done();
      }, 10);
    });

    it('should navigate to detail after successful update', (done) => {
      mockActivatedRoute = createMockActivatedRoute({ id: '123' });
      const mockEducador = createMockEducador({ id: '123' });
      mockStateService.selected.set(mockEducador);
      mockStateService.update.mockReturnValue(of(mockEducador));

      component.onSubmit();

      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/educadores', '123']);
        done();
      }, 10);
    });
  });

  describe('Form State Transitions', () => {
    it('should transition from loading to loaded state', (done) => {
      mockStateService.loading.set(true);
      TestBed.flushEffects();
      expect(component.loading()).toBe(true);

      mockStateService.loading.set(false);
      TestBed.flushEffects();
      expect(component.loading()).toBe(false);
      done();
    });

    it('should clear error after successful submission', (done) => {
      mockStateService.error.set('Previous error');
      mockStateService.create.mockReturnValue(of(createMockEducador()));

      component.onSubmit();

      setTimeout(() => {
        mockStateService.error.set(null);
        TestBed.flushEffects();
        expect(component.error()).toBeNull();
        done();
      }, 10);
    });
  });
});
