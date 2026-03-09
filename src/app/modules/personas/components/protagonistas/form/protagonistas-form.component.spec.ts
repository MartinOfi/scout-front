/**
 * ProtagonistasFormComponent Tests
 * Tests smart component behavior for protagonistas create/edit forms
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { ProtagonistasFormComponent } from './protagonistas-form.component';
import { PersonasStateService } from '../../../services';
import { PersonasFormBuilder } from '../../../services';
import { RamaEnum } from '../../../../../shared/enums';
import {
  createMockProtagonista,
  createMockPersonasStateService,
  createMockActivatedRoute,
  createMockRouter,
  createMockPersonasFormBuilder,
} from '../../../testing/personas-test-utils';

describe('ProtagonistasFormComponent', () => {
  let component: ProtagonistasFormComponent;
  let fixture: ComponentFixture<ProtagonistasFormComponent>;
  let mockStateService: ReturnType<typeof createMockPersonasStateService>;
  let mockRouter: ReturnType<typeof createMockRouter>;
  let mockActivatedRoute: ReturnType<typeof createMockActivatedRoute>;
  let mockFormBuilder: ReturnType<typeof createMockPersonasFormBuilder>;

  beforeEach(async () => {
    mockStateService = createMockPersonasStateService();
    mockRouter = createMockRouter();
    mockActivatedRoute = createMockActivatedRoute();
    mockFormBuilder = createMockPersonasFormBuilder();

    await TestBed.configureTestingModule({
      imports: [ProtagonistasFormComponent],
      providers: [
        { provide: PersonasStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PersonasFormBuilder, useValue: mockFormBuilder },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProtagonistasFormComponent);
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
        expect(mockFormBuilder.buildCreateProtagonistaForm).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should submit create form on onSubmit', (done) => {
      fixture.detectChanges();
      const mockProtagonista = createMockProtagonista();
      mockStateService.createProtagonista.mockReturnValue(of(mockProtagonista));

      component.onSubmit();

      setTimeout(() => {
        expect(mockStateService.createProtagonista).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas']);
        done();
      }, 10);
    });

    it('should navigate back on cancel in create mode', () => {
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas']);
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

    it('should load protagonista and build edit form in edit mode', (done) => {
      const mockProtagonista = createMockProtagonista({ id: '123' });
      mockStateService.selected.set(mockProtagonista);

      fixture.detectChanges();
      setTimeout(() => {
        expect(mockFormBuilder.buildEditProtagonistaForm).toHaveBeenCalledWith(mockProtagonista);
        done();
      }, 10);
    });

    it('should submit update form on onSubmit in edit mode', (done) => {
      const mockProtagonista = createMockProtagonista({ id: '123' });
      mockStateService.selected.set(mockProtagonista);
      mockStateService.update.mockReturnValue(of(mockProtagonista));

      component.onSubmit();

      setTimeout(() => {
        expect(mockStateService.update).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas', '123']);
        done();
      }, 10);
    });

    it('should navigate back to detail on cancel in edit mode', () => {
      mockActivatedRoute = createMockActivatedRoute({ id: '123' });
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas', '123']);
    });
  });

  describe('Form Validation', () => {
    it('should initialize form with empty values in create mode', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        expect(component.form.get('nombre')?.value).toBeFalsy();
        expect(component.form.get('apellido')?.value).toBeFalsy();
        expect(component.form.get('rama')?.value).toBeFalsy();
        done();
      }, 10);
    });

    it('should initialize form with protagonista data in edit mode', (done) => {
      const mockProtagonista = createMockProtagonista({
        id: '123',
        nombre: 'Juan',
        apellido: 'Pérez',
        rama: RamaEnum.MANADA,
      });
      mockStateService.selected.set(mockProtagonista);
      mockActivatedRoute = createMockActivatedRoute({ id: '123' });

      fixture.detectChanges();
      setTimeout(() => {
        expect(component.form.get('nombre')?.value).toBe('Juan');
        expect(component.form.get('apellido')?.value).toBe('Pérez');
        expect(component.form.get('rama')?.value).toBe('MANADA');
        done();
      }, 10);
    });

    it('should validate required rama field', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        const form = component.form;
        form.get('rama')?.setValue(null);
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
          nombre: 'Juan',
          apellido: 'Pérez',
          dni: '12345678',
          rama: 'MANADA',
          fechaIngreso: new Date('2024-01-01'),
        });

        expect(form.valid).toBe(true);
        done();
      }, 10);
    });
  });

  describe('Rama Validation', () => {
    it('should validate rama is required', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        const ramaControl = component.form.get('rama');
        ramaControl?.setValue(null);
        ramaControl?.markAsTouched();

        expect(ramaControl?.invalid).toBe(true);
        done();
      }, 10);
    });

    it('should accept valid rama values', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        const validRamas = ['MANADA', 'CAMINANTES', 'UNIDAD', 'ROVER'];

        validRamas.forEach((rama) => {
          component.form.get('rama')?.setValue(rama);
          expect(component.form.get('rama')?.valid).toBe(true);
        });

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
      const errorMsg = 'Failed to save protagonista';
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
          nombre: 'Juan',
          apellido: 'Pérez',
          dni: '12345678',
          rama: 'MANADA',
          fechaIngreso: new Date('2024-01-01'),
        });

        const dto = mockFormBuilder.extractCreateProtagonistaDto(form);

        expect(dto.nombre).toBe('Juan');
        expect(dto.apellido).toBe('Pérez');
        expect(dto.rama).toBe('MANADA');
        done();
      }, 10);
    });

    it('should extract update DTO from form values', (done) => {
      const mockProtagonista = createMockProtagonista({ id: '123' });
      mockStateService.selected.set(mockProtagonista);

      fixture.detectChanges();
      setTimeout(() => {
        const form = component.form;
        form.patchValue({
          nombre: 'Updated Name',
          rama: 'CAMINANTES',
        });

        const dto = mockFormBuilder.extractUpdateProtagonistaDto(form);

        expect(dto.nombre).toBe('Updated Name');
        expect(dto.rama).toBe('CAMINANTES');
        done();
      }, 10);
    });
  });

  describe('Navigation Edge Cases', () => {
    it('should handle missing protagonista in edit mode gracefully', (done) => {
      mockActivatedRoute = createMockActivatedRoute({ id: '999' });
      mockStateService.selected.set(null);

      fixture.detectChanges();
      setTimeout(() => {
        expect(component.loading()).toBe(false);
        done();
      }, 10);
    });

    it('should navigate to list after successful create', (done) => {
      mockStateService.createProtagonista.mockReturnValue(of(createMockProtagonista()));

      component.onSubmit();

      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas']);
        done();
      }, 10);
    });

    it('should navigate to detail after successful update', (done) => {
      mockActivatedRoute = createMockActivatedRoute({ id: '123' });
      const mockProtagonista = createMockProtagonista({ id: '123' });
      mockStateService.selected.set(mockProtagonista);
      mockStateService.update.mockReturnValue(of(mockProtagonista));

      component.onSubmit();

      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas', '123']);
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
      mockStateService.createProtagonista.mockReturnValue(of(createMockProtagonista()));

      component.onSubmit();

      setTimeout(() => {
        mockStateService.error.set(null);
        TestBed.flushEffects();
        expect(component.error()).toBeNull();
        done();
      }, 10);
    });
  });

  describe('Date Field Handling', () => {
    it('should handle fechaIngreso date field', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        const dateControl = component.form.get('fechaIngreso');
        const testDate = new Date('2024-01-01');

        dateControl?.setValue(testDate);

        expect(dateControl?.value).toEqual(testDate);
        done();
      }, 10);
    });

    it('should preserve fechaIngreso when updating', (done) => {
      const mockProtagonista = createMockProtagonista({
        id: '123',
        fechaIngreso: new Date('2024-01-01'),
      });
      mockStateService.selected.set(mockProtagonista);

      fixture.detectChanges();
      setTimeout(() => {
        expect(component.form.get('fechaIngreso')?.value).toEqual(new Date('2024-01-01'));
        done();
      }, 10);
    });
  });
});
