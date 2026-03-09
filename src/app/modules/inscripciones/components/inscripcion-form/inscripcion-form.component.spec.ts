/**
 * InscripcionFormComponent Tests
 * Tests smart component behavior for inscripcion form
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { InscripcionFormComponent } from './inscripcion-form.component';
import { InscripcionesStateService } from '../../services/inscripciones-state.service';
import { Inscripcion, InscripcionConEstado } from '../../../../shared/models';
import { TipoInscripcion } from '../../../../shared/enums';
import { MockRouter } from '../../../../shared/testing/common-mocks';

interface MockInscripcionesStateService {
  inscripciones: ReturnType<typeof signal<Inscripcion[]>>;
  loading: ReturnType<typeof signal<boolean>>;
  error: ReturnType<typeof signal<string | null>>;
  selectedDetail: ReturnType<typeof signal<InscripcionConEstado | null>>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
}

const createMockInscripcion = (overrides: Partial<Inscripcion> = {}): Inscripcion => ({
  id: 'insc-1',
  personaId: 'pers-1',
  tipo: 'scout_argentina',
  ano: 2026,
  montoTotal: 15000,
  montoBonificado: 0,
  declaracionDeSalud: false,
  autorizacionDeImagen: false,
  salidasCercanas: false,
  autorizacionIngreso: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('InscripcionFormComponent', () => {
  let component: InscripcionFormComponent;
  let fixture: ComponentFixture<InscripcionFormComponent>;
  let mockStateService: MockInscripcionesStateService;
  let mockRouter: MockRouter;
  let mockActivatedRoute: { snapshot: { paramMap: ReturnType<typeof convertToParamMap> } };

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({}),
      },
    };

    mockStateService = {
      inscripciones: signal<Inscripcion[]>([]),
      loading: signal<boolean>(false),
      error: signal<string | null>(null),
      selectedDetail: signal<InscripcionConEstado | null>(null),
      create: vi.fn().mockReturnValue(of(createMockInscripcion())),
      update: vi.fn().mockReturnValue(of(createMockInscripcion())),
    };

    await TestBed.configureTestingModule({
      imports: [InscripcionFormComponent],
      providers: [
        FormBuilder,
        { provide: InscripcionesStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InscripcionFormComponent);
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
      expect(component.loading).toBe(mockStateService.loading);
    });

    it('should have form defined', () => {
      expect(component.inscripcionForm).toBeDefined();
    });

    it('should expose loading signal', () => {
      expect(component.loading).toBe(mockStateService.loading);
    });

    it('should have tipos array initialized', () => {
      expect(component.tipos).toBeDefined();
      expect(component.tipos).toContain('grupo');
      expect(component.tipos).toContain('scout_argentina');
    });

    it('should have tipoLabels defined', () => {
      expect(component.tipoLabels).toBeDefined();
      expect(component.tipoLabels['grupo']).toBe('Grupo');
      expect(component.tipoLabels['scout_argentina']).toBe('Scout Argentina');
    });

    it('should not be in editing mode by default', () => {
      component.ngOnInit();
      expect(component.isEditing).toBe(false);
    });
  });

  describe('Form Structure', () => {
    it('should have required form controls', () => {
      expect(component.inscripcionForm.get('personaId')).toBeTruthy();
      expect(component.inscripcionForm.get('tipo')).toBeTruthy();
      expect(component.inscripcionForm.get('ano')).toBeTruthy();
      expect(component.inscripcionForm.get('montoTotal')).toBeTruthy();
      expect(component.inscripcionForm.get('montoBonificado')).toBeTruthy();
    });

    it('should have authorization checkboxes', () => {
      expect(component.inscripcionForm.get('declaracionDeSalud')).toBeTruthy();
      expect(component.inscripcionForm.get('autorizacionDeImagen')).toBeTruthy();
      expect(component.inscripcionForm.get('salidasCercanas')).toBeTruthy();
      expect(component.inscripcionForm.get('autorizacionIngreso')).toBeTruthy();
    });

    it('should validate required fields', () => {
      component.inscripcionForm.get('personaId')?.setValue('');
      component.inscripcionForm.markAllAsTouched();

      expect(component.inscripcionForm.invalid).toBe(true);
    });

    it('should be valid with required fields filled', () => {
      component.inscripcionForm.patchValue({
        personaId: 'persona-1',
        tipo: 'scout_argentina',
        ano: 2026,
        montoTotal: 15000,
      });

      expect(component.inscripcionForm.valid).toBe(true);
    });

    it('should have default tipo set to scout_argentina', () => {
      expect(component.inscripcionForm.get('tipo')?.value).toBe('scout_argentina');
    });

    it('should have default ano set to current year', () => {
      expect(component.inscripcionForm.get('ano')?.value).toBe(new Date().getFullYear());
    });

    it('should have authorization fields default to false', () => {
      expect(component.inscripcionForm.get('declaracionDeSalud')?.value).toBe(false);
      expect(component.inscripcionForm.get('autorizacionDeImagen')?.value).toBe(false);
      expect(component.inscripcionForm.get('salidasCercanas')?.value).toBe(false);
      expect(component.inscripcionForm.get('autorizacionIngreso')?.value).toBe(false);
    });
  });

  describe('Edit Mode', () => {
    it('should enter edit mode when id param is present', () => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'insc-123' });
      mockStateService.inscripciones.set([createMockInscripcion({ id: 'insc-123' })]);

      component.ngOnInit();

      expect(component.isEditing).toBe(true);
      expect(component.inscripcionId).toBe('insc-123');
    });

    it('should load inscripcion data in edit mode', () => {
      const inscripcion = createMockInscripcion({
        id: 'insc-123',
        personaId: 'pers-456',
        tipo: 'grupo',
        ano: 2025,
        montoTotal: 20000,
        montoBonificado: 5000,
        declaracionDeSalud: true,
      });

      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'insc-123' });
      mockStateService.inscripciones.set([inscripcion]);

      component.ngOnInit();

      expect(component.inscripcionForm.get('personaId')?.value).toBe('pers-456');
      expect(component.inscripcionForm.get('tipo')?.value).toBe('grupo');
      expect(component.inscripcionForm.get('ano')?.value).toBe(2025);
      expect(component.inscripcionForm.get('montoTotal')?.value).toBe(20000);
      expect(component.inscripcionForm.get('montoBonificado')?.value).toBe(5000);
      expect(component.inscripcionForm.get('declaracionDeSalud')?.value).toBe(true);
    });

    it('should disable non-editable fields in edit mode', () => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'insc-123' });
      mockStateService.inscripciones.set([createMockInscripcion({ id: 'insc-123' })]);

      component.ngOnInit();

      expect(component.inscripcionForm.get('personaId')?.disabled).toBe(true);
      expect(component.inscripcionForm.get('tipo')?.disabled).toBe(true);
      expect(component.inscripcionForm.get('ano')?.disabled).toBe(true);
      expect(component.inscripcionForm.get('montoTotal')?.disabled).toBe(true);
    });

    it('should keep editable fields enabled in edit mode', () => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'insc-123' });
      mockStateService.inscripciones.set([createMockInscripcion({ id: 'insc-123' })]);

      component.ngOnInit();

      expect(component.inscripcionForm.get('montoBonificado')?.disabled).toBe(false);
      expect(component.inscripcionForm.get('declaracionDeSalud')?.disabled).toBe(false);
      expect(component.inscripcionForm.get('autorizacionDeImagen')?.disabled).toBe(false);
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
  });

  describe('Form Submission - Create', () => {
    it('should not submit invalid form', () => {
      component.inscripcionForm.patchValue({
        personaId: '',
      });
      component.inscripcionForm.markAllAsTouched();

      component.onSubmit();

      expect(mockStateService.create).not.toHaveBeenCalled();
    });

    it('should call create with valid form in create mode', fakeAsync(() => {
      component.inscripcionForm.patchValue({
        personaId: 'persona-1',
        tipo: 'scout_argentina',
        ano: 2026,
        montoTotal: 15000,
      });

      component.onSubmit();
      tick();

      expect(mockStateService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          personaId: 'persona-1',
          tipo: 'scout_argentina',
          ano: 2026,
          montoTotal: 15000,
        })
      );
    }));

    it('should navigate after successful create', fakeAsync(() => {
      component.inscripcionForm.patchValue({
        personaId: 'persona-1',
        tipo: 'scout_argentina',
        ano: 2026,
        montoTotal: 15000,
      });

      component.onSubmit();
      tick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/inscripciones']);
    }));

    it('should include authorization fields when true', fakeAsync(() => {
      component.inscripcionForm.patchValue({
        personaId: 'persona-1',
        tipo: 'scout_argentina',
        ano: 2026,
        montoTotal: 15000,
        declaracionDeSalud: true,
        autorizacionDeImagen: true,
      });

      component.onSubmit();
      tick();

      expect(mockStateService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          declaracionDeSalud: true,
          autorizacionDeImagen: true,
        })
      );
    }));
  });

  describe('Form Submission - Update', () => {
    it('should call update in edit mode', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'insc-123' });
      mockStateService.inscripciones.set([createMockInscripcion({ id: 'insc-123' })]);

      component.ngOnInit();

      component.inscripcionForm.patchValue({
        montoBonificado: 5000,
        declaracionDeSalud: true,
      });

      component.onSubmit();
      tick();

      expect(mockStateService.update).toHaveBeenCalledWith(
        'insc-123',
        expect.objectContaining({
          montoBonificado: 5000,
          declaracionDeSalud: true,
        })
      );
    }));

    it('should navigate after successful update', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'insc-123' });
      mockStateService.inscripciones.set([createMockInscripcion({ id: 'insc-123' })]);

      component.ngOnInit();
      component.onSubmit();
      tick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/inscripciones']);
    }));
  });

  describe('Cancel Action', () => {
    it('should navigate back on cancel', () => {
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/inscripciones']);
    });

    it('should not submit form on cancel', () => {
      component.onCancel();

      expect(mockStateService.create).not.toHaveBeenCalled();
      expect(mockStateService.update).not.toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize on ngOnInit', () => {
      component.ngOnInit();

      expect(component).toBeTruthy();
      expect(component.isEditing).toBe(false);
    });

    it('should maintain form state throughout lifecycle', () => {
      const formValue = {
        personaId: 'persona-1',
        tipo: 'scout_argentina' as TipoInscripcion,
        ano: 2026,
        montoTotal: 15000,
      };

      component.inscripcionForm.patchValue(formValue);

      const value1 = component.inscripcionForm.value;

      component.inscripcionForm.patchValue(formValue);

      const value2 = component.inscripcionForm.value;

      expect(value1.personaId).toBe(value2.personaId);
      expect(value1.tipo).toBe(value2.tipo);
    });
  });
});
