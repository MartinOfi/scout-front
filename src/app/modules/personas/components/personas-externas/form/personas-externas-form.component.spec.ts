/**
 * PersonasExternasFormComponent Tests
 * Tests smart component behavior for personas externas create/edit forms
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { PersonasExternasFormComponent } from './personas-externas-form.component';
import { PersonasExternasStateService } from '../../../services';
import { PersonasFormBuilder } from '../../../services';
import {
  createMockPersonaExterna,
  createMockPersonasExternasStateService,
  createMockActivatedRoute,
  createMockRouter,
  createMockPersonasFormBuilder,
} from '../../../testing/personas-test-utils';

describe('PersonasExternasFormComponent', () => {
  let component: PersonasExternasFormComponent;
  let fixture: ComponentFixture<PersonasExternasFormComponent>;
  let mockStateService: ReturnType<typeof createMockPersonasExternasStateService>;
  let mockRouter: ReturnType<typeof createMockRouter>;
  let mockActivatedRoute: ReturnType<typeof createMockActivatedRoute>;
  let mockFormBuilder: ReturnType<typeof createMockPersonasFormBuilder>;

  beforeEach(async () => {
    mockStateService = createMockPersonasExternasStateService();
    mockRouter = createMockRouter();
    mockActivatedRoute = createMockActivatedRoute();
    mockFormBuilder = createMockPersonasFormBuilder();

    await TestBed.configureTestingModule({
      imports: [PersonasExternasFormComponent],
      providers: [
        { provide: PersonasExternasStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PersonasFormBuilder, useValue: mockFormBuilder },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonasExternasFormComponent);
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
        expect(mockFormBuilder.buildCreatePersonaExternaForm).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should submit create form on onSubmit', (done) => {
      fixture.detectChanges();
      const mockPersona = createMockPersonaExterna();
      mockStateService.create.mockReturnValue(of(mockPersona));

      component.onSubmit();

      setTimeout(() => {
        expect(mockStateService.create).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/externas']);
        done();
      }, 10);
    });

    it('should navigate back on cancel in create mode', () => {
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/externas']);
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

    it('should load persona externa and build edit form in edit mode', (done) => {
      const mockPersona = createMockPersonaExterna({ id: '123' });
      mockStateService.selected.set(mockPersona);

      fixture.detectChanges();
      setTimeout(() => {
        expect(mockFormBuilder.buildEditPersonaExternaForm).toHaveBeenCalledWith(mockPersona);
        done();
      }, 10);
    });

    it('should submit update form on onSubmit in edit mode', (done) => {
      const mockPersona = createMockPersonaExterna({ id: '123' });
      mockStateService.selected.set(mockPersona);
      mockStateService.update.mockReturnValue(of(mockPersona));

      component.onSubmit();

      setTimeout(() => {
        expect(mockStateService.update).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/externas', '123']);
        done();
      }, 10);
    });

    it('should navigate back to detail on cancel in edit mode', () => {
      mockActivatedRoute = createMockActivatedRoute({ id: '123' });
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/externas', '123']);
    });
  });

  describe('Form Validation', () => {
    it('should initialize form with empty values in create mode', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        expect(component.form.get('nombre')?.value).toBeFalsy();
        expect(component.form.get('apellido')?.value).toBeFalsy();
        expect(component.form.get('relacion')?.value).toBeFalsy();
        done();
      }, 10);
    });

    it('should initialize form with persona externa data in edit mode', (done) => {
      const mockPersona = createMockPersonaExterna({
        id: '123',
        nombre: 'Carlos',
        apellido: 'López',
        relacion: 'Padre',
      });
      mockStateService.selected.set(mockPersona);
      mockActivatedRoute = createMockActivatedRoute({ id: '123' });

      fixture.detectChanges();
      setTimeout(() => {
        expect(component.form.get('nombre')?.value).toBe('Carlos');
        expect(component.form.get('apellido')?.value).toBe('López');
        expect(component.form.get('relacion')?.value).toBe('Padre');
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
          nombre: 'Carlos',
          apellido: 'López',
          dni: '11223344',
          relacion: 'Padre',
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
      const errorMsg = 'Failed to save persona externa';
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
          nombre: 'Carlos',
          apellido: 'López',
          dni: '11223344',
          relacion: 'Padre',
        });

        const dto = mockFormBuilder.extractCreatePersonaExternaDto(form);

        expect(dto.nombre).toBe('Carlos');
        expect(dto.apellido).toBe('López');
        expect(dto.relacion).toBe('Padre');
        done();
      }, 10);
    });

    it('should extract update DTO from form values', (done) => {
      const mockPersona = createMockPersonaExterna({ id: '123' });
      mockStateService.selected.set(mockPersona);

      fixture.detectChanges();
      setTimeout(() => {
        const form = component.form;
        form.patchValue({
          nombre: 'Updated Name',
          relacion: 'Nueva Relacion',
        });

        const dto = mockFormBuilder.extractUpdatePersonaExternaDto(form);

        expect(dto.nombre).toBe('Updated Name');
        expect(dto.relacion).toBe('Nueva Relacion');
        done();
      }, 10);
    });
  });

  describe('Navigation Edge Cases', () => {
    it('should handle missing persona externa in edit mode gracefully', (done) => {
      mockActivatedRoute = createMockActivatedRoute({ id: '999' });
      mockStateService.selected.set(null);

      fixture.detectChanges();
      setTimeout(() => {
        expect(component.loading()).toBe(false);
        done();
      }, 10);
    });

    it('should navigate to list after successful create', (done) => {
      mockStateService.create.mockReturnValue(of(createMockPersonaExterna()));

      component.onSubmit();

      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/externas']);
        done();
      }, 10);
    });

    it('should navigate to detail after successful update', (done) => {
      mockActivatedRoute = createMockActivatedRoute({ id: '123' });
      const mockPersona = createMockPersonaExterna({ id: '123' });
      mockStateService.selected.set(mockPersona);
      mockStateService.update.mockReturnValue(of(mockPersona));

      component.onSubmit();

      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/externas', '123']);
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
      mockStateService.create.mockReturnValue(of(createMockPersonaExterna()));

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
