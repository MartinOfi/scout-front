/**
 * InscripcionFormComponent Tests
 * Tests smart component behavior for inscripcion form
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { signal, WritableSignal } from '@angular/core';
import { of } from 'rxjs';

import { InscripcionFormComponent } from './inscripcion-form.component';
import { InscripcionesStateService } from '../../services/inscripciones-state.service';
import { PersonasStateService } from '../../../personas/services/personas-state.service';
import { CajasApiService } from '../../../cajas/services/cajas-api.service';
import { CajasStateService } from '../../../cajas/services/cajas-state.service';
import { ConfiguracionService } from '../../../../shared/services';
import {
  CreateInscripcionDto,
  Inscripcion,
  InscripcionConEstado,
  PersonaUnion,
} from '../../../../shared/models';
import { TipoInscripcion } from '../../../../shared/enums';
import { MockRouter, createMockRouter } from '../../../../shared/testing/common-mocks';

/** Montos de configuración usados por el mock de ConfiguracionService */
const MONTO_SCOUT_ARGENTINA = 15000;
const MONTO_GRUPO = 8000;

interface MockInscripcionesStateService {
  inscripciones: WritableSignal<Inscripcion[]>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  selectedDetail: WritableSignal<InscripcionConEstado | null>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
}

interface MockPersonasStateService {
  allPersonas: WritableSignal<PersonaUnion[]>;
  loading: WritableSignal<boolean>;
  load: ReturnType<typeof vi.fn>;
}

interface MockCajasStateService {
  saldoFondoSolidario: WritableSignal<number>;
  loadFondoSolidario: ReturnType<typeof vi.fn>;
}

interface MockCajasApiService {
  getSaldoCuentaPersonal: ReturnType<typeof vi.fn>;
}

interface MockConfiguracionService {
  getMontoByTipo: ReturnType<typeof vi.fn>;
}

interface MockActivatedRouteSnapshot {
  snapshot: { paramMap: ParamMap; queryParamMap: ParamMap };
}

const createMockInscripcion = (overrides: Partial<Inscripcion> = {}): Inscripcion => ({
  id: 'insc-1',
  personaId: 'pers-1',
  tipo: 'scout_argentina',
  ano: 2026,
  montoTotal: MONTO_SCOUT_ARGENTINA,
  montoBonificado: 0,
  declaracionDeSalud: false,
  autorizacionDeImagen: false,
  salidasCercanas: false,
  autorizacionIngreso: false,
  certificadoAptitudFisica: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('InscripcionFormComponent', () => {
  let component: InscripcionFormComponent;
  let fixture: ComponentFixture<InscripcionFormComponent>;
  let mockStateService: MockInscripcionesStateService;
  let mockPersonasState: MockPersonasStateService;
  let mockCajasState: MockCajasStateService;
  let mockCajasApi: MockCajasApiService;
  let mockConfigService: MockConfiguracionService;
  let mockRouter: MockRouter;
  let mockActivatedRoute: MockActivatedRouteSnapshot;

  /** Último DTO pasado a state.create() */
  const lastCreateDto = (): CreateInscripcionDto =>
    mockStateService.create.mock.calls[0][0] as CreateInscripcionDto;

  beforeEach(async () => {
    mockRouter = createMockRouter();

    mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({}),
        queryParamMap: convertToParamMap({}),
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

    mockPersonasState = {
      allPersonas: signal<PersonaUnion[]>([]),
      loading: signal<boolean>(false),
      load: vi.fn(),
    };

    mockCajasState = {
      saldoFondoSolidario: signal<number>(50000),
      loadFondoSolidario: vi.fn(),
    };

    mockCajasApi = {
      getSaldoCuentaPersonal: vi.fn().mockReturnValue(of(0)),
    };

    mockConfigService = {
      getMontoByTipo: vi
        .fn()
        .mockImplementation((tipo: TipoInscripcion) =>
          tipo === 'scout_argentina' ? MONTO_SCOUT_ARGENTINA : MONTO_GRUPO,
        ),
    };

    await TestBed.configureTestingModule({
      imports: [InscripcionFormComponent],
      providers: [
        FormBuilder,
        { provide: InscripcionesStateService, useValue: mockStateService },
        { provide: PersonasStateService, useValue: mockPersonasState },
        { provide: CajasStateService, useValue: mockCajasState },
        { provide: CajasApiService, useValue: mockCajasApi },
        { provide: ConfiguracionService, useValue: mockConfigService },
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

    it('should have form defined', () => {
      expect(component.inscripcionForm).toBeDefined();
    });

    it('should expose loading signal', () => {
      expect(component.loading).toBe(mockStateService.loading);
    });

    it('should have tipos array initialized', () => {
      expect(component.tipos).toContain('grupo');
      expect(component.tipos).toContain('scout_argentina');
    });

    it('should not be in editing mode by default', () => {
      component.ngOnInit();

      expect(component.isEditing).toBe(false);
    });

    it('should fill montoTotal from config on init', () => {
      component.ngOnInit();

      expect(component.inscripcionForm.get('montoTotal')?.value).toBe(MONTO_SCOUT_ARGENTINA);
    });
  });

  describe('Form Structure', () => {
    it('should have required form controls', () => {
      expect(component.inscripcionForm.get('personaId')).toBeTruthy();
      expect(component.inscripcionForm.get('tipo')).toBeTruthy();
      expect(component.inscripcionForm.get('ano')).toBeTruthy();
      expect(component.inscripcionForm.get('montoTotal')).toBeTruthy();
      expect(component.inscripcionForm.get('personaNueva')).toBeTruthy();
    });

    it('should have default tipo set to scout_argentina', () => {
      expect(component.inscripcionForm.get('tipo')?.value).toBe('scout_argentina');
    });

    it('should have default ano set to current year', () => {
      expect(component.inscripcionForm.get('ano')?.value).toBe(new Date().getFullYear());
    });

    it('should have personaNueva unchecked by default', () => {
      expect(component.inscripcionForm.get('personaNueva')?.value).toBe(false);
      expect(component.esPersonaNueva()).toBe(false);
    });
  });

  // ==========================================================================
  // Persona nueva - inscripción sin costo
  // ==========================================================================

  describe('Persona nueva', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should set montoTotal to 0 when checked', () => {
      component.inscripcionForm.get('personaNueva')?.setValue(true);

      expect(component.inscripcionForm.get('montoTotal')?.value).toBe(0);
      expect(component.esPersonaNueva()).toBe(true);
    });

    it('should disable every payment control when checked', () => {
      component.inscripcionForm.get('personaNueva')?.setValue(true);

      expect(component.inscripcionForm.get('montoPagado')?.disabled).toBe(true);
      expect(component.inscripcionForm.get('medioPago')?.disabled).toBe(true);
      expect(component.inscripcionForm.get('montoConSaldoPersonal')?.disabled).toBe(true);
      expect(component.inscripcionForm.get('montoBonificado')?.disabled).toBe(true);
    });

    it('should zero out amounts already loaded when checked', () => {
      component.inscripcionForm.patchValue({
        montoPagado: 5000,
        montoConSaldoPersonal: 3000,
        montoBonificado: 2000,
      });

      component.inscripcionForm.get('personaNueva')?.setValue(true);

      const raw = component.inscripcionForm.getRawValue();
      expect(raw.montoPagado).toBe(0);
      expect(raw.montoConSaldoPersonal).toBe(0);
      expect(raw.montoBonificado).toBe(0);
    });

    it('should restore config amount and re-enable controls when unchecked', () => {
      component.inscripcionForm.get('personaNueva')?.setValue(true);
      component.inscripcionForm.get('personaNueva')?.setValue(false);

      expect(component.inscripcionForm.get('montoTotal')?.value).toBe(MONTO_SCOUT_ARGENTINA);
      expect(component.inscripcionForm.get('montoPagado')?.disabled).toBe(false);
      expect(component.inscripcionForm.get('medioPago')?.disabled).toBe(false);
      expect(component.inscripcionForm.get('montoConSaldoPersonal')?.disabled).toBe(false);
      expect(component.inscripcionForm.get('montoBonificado')?.disabled).toBe(false);
      expect(component.esPersonaNueva()).toBe(false);
    });

    it('should uncheck itself when tipo switches away from scout_argentina', () => {
      component.inscripcionForm.get('personaNueva')?.setValue(true);

      component.inscripcionForm.get('tipo')?.setValue('grupo');

      expect(component.inscripcionForm.get('personaNueva')?.value).toBe(false);
      expect(component.esPersonaNueva()).toBe(false);
      expect(component.inscripcionForm.get('montoTotal')?.value).toBe(MONTO_GRUPO);
      expect(component.inscripcionForm.get('montoPagado')?.disabled).toBe(false);
    });

    it('should not touch the personal account balance when checked', () => {
      component.saldoCuentaPersonal.set(9000);
      component.inscripcionForm.get('personaNueva')?.setValue(true);

      component.usarSaldoDisponible();

      expect(component.inscripcionForm.getRawValue().montoConSaldoPersonal).toBe(0);
    });

    it('should submit montoTotal 0 without payment fields', () => {
      component.inscripcionForm.patchValue({ personaId: 'persona-1' });
      component.inscripcionForm.get('personaNueva')?.setValue(true);

      component.onSubmit();

      expect(mockStateService.create).toHaveBeenCalled();
      const dto = lastCreateDto();
      expect(dto.montoTotal).toBe(0);
      expect(dto.montoPagado).toBeUndefined();
      expect(dto.medioPago).toBeUndefined();
      expect(dto.montoConSaldoPersonal).toBeUndefined();
      expect(dto.montoBonificado).toBeUndefined();
    });

    it('should keep authorizations when submitting a free inscription', () => {
      component.inscripcionForm.patchValue({
        personaId: 'persona-1',
        declaracionDeSalud: true,
      });
      component.inscripcionForm.get('personaNueva')?.setValue(true);

      component.onSubmit();

      const dto = lastCreateDto();
      expect(dto.declaracionDeSalud).toBe(true);
      expect(dto.montoTotal).toBe(0);
    });

    it('should not send personaNueva to the backend', () => {
      component.inscripcionForm.patchValue({ personaId: 'persona-1' });
      component.inscripcionForm.get('personaNueva')?.setValue(true);

      component.onSubmit();

      expect('personaNueva' in lastCreateDto()).toBe(false);
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'insc-123' });
    });

    it('should enter edit mode when id param is present', () => {
      mockStateService.inscripciones.set([createMockInscripcion({ id: 'insc-123' })]);

      component.ngOnInit();

      expect(component.isEditing).toBe(true);
      expect(component.inscripcionId).toBe('insc-123');
    });

    it('should load inscripcion data in edit mode', () => {
      mockStateService.inscripciones.set([
        createMockInscripcion({
          id: 'insc-123',
          personaId: 'pers-456',
          tipo: 'scout_argentina',
          ano: 2025,
          montoTotal: 20000,
          declaracionDeSalud: true,
        }),
      ]);

      component.ngOnInit();

      const raw = component.inscripcionForm.getRawValue();
      expect(raw.personaId).toBe('pers-456');
      expect(raw.tipo).toBe('scout_argentina');
      expect(raw.ano).toBe(2025);
      expect(raw.montoTotal).toBe(20000);
      expect(raw.declaracionDeSalud).toBe(true);
    });

    it('should clear authorizations when loading a grupo inscripcion', () => {
      // Las autorizaciones son exclusivas de Scout Argentina: el backend las
      // guarda siempre en false para GRUPO y el form replica esa regla.
      mockStateService.inscripciones.set([
        createMockInscripcion({ id: 'insc-123', tipo: 'grupo', declaracionDeSalud: true }),
      ]);

      component.ngOnInit();

      expect(component.showAuthorizationFields()).toBe(false);
      expect(component.inscripcionForm.getRawValue().declaracionDeSalud).toBe(false);
    });

    it('should disable non-editable fields in edit mode', () => {
      mockStateService.inscripciones.set([createMockInscripcion({ id: 'insc-123' })]);

      component.ngOnInit();

      expect(component.inscripcionForm.get('personaId')?.disabled).toBe(true);
      expect(component.inscripcionForm.get('tipo')?.disabled).toBe(true);
      expect(component.inscripcionForm.get('ano')?.disabled).toBe(true);
      expect(component.inscripcionForm.get('montoTotal')?.disabled).toBe(true);
    });

    it('should keep authorization fields enabled in edit mode', () => {
      mockStateService.inscripciones.set([createMockInscripcion({ id: 'insc-123' })]);

      component.ngOnInit();

      expect(component.inscripcionForm.get('declaracionDeSalud')?.disabled).toBe(false);
      expect(component.inscripcionForm.get('autorizacionDeImagen')?.disabled).toBe(false);
    });
  });

  describe('Form Submission - Create', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should not submit invalid form', () => {
      component.inscripcionForm.patchValue({ personaId: '' });
      component.inscripcionForm.markAllAsTouched();

      component.onSubmit();

      expect(mockStateService.create).not.toHaveBeenCalled();
    });

    it('should call create with valid form in create mode', () => {
      component.inscripcionForm.patchValue({ personaId: 'persona-1', ano: 2026 });

      component.onSubmit();

      expect(mockStateService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          personaId: 'persona-1',
          tipo: 'scout_argentina',
          ano: 2026,
          montoTotal: MONTO_SCOUT_ARGENTINA,
        }),
      );
    });

    it('should navigate with tipo query param after successful create', () => {
      component.inscripcionForm.patchValue({ personaId: 'persona-1' });

      component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/inscripciones'], {
        queryParams: { tipo: 'scout_argentina' },
      });
    });

    it('should include authorization fields when true', () => {
      component.inscripcionForm.patchValue({
        personaId: 'persona-1',
        declaracionDeSalud: true,
        autorizacionDeImagen: true,
      });

      component.onSubmit();

      expect(mockStateService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          declaracionDeSalud: true,
          autorizacionDeImagen: true,
        }),
      );
    });

    it('should block submit when montos exceed montoTotal', () => {
      component.inscripcionForm.patchValue({
        personaId: 'persona-1',
        montoPagado: MONTO_SCOUT_ARGENTINA + 1,
      });

      component.onSubmit();

      expect(component.montosExcedenTotal()).toBe(true);
      expect(mockStateService.create).not.toHaveBeenCalled();
    });

    it('should block submit when bonificacion exceeds fondo solidario', () => {
      mockCajasState.saldoFondoSolidario.set(1000);
      component.inscripcionForm.patchValue({
        personaId: 'persona-1',
        montoBonificado: 5000,
      });

      component.onSubmit();

      expect(component.saldoFondoInsuficiente).toBe(true);
      expect(mockStateService.create).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission - Update', () => {
    beforeEach(() => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({ id: 'insc-123' });
      mockStateService.inscripciones.set([createMockInscripcion({ id: 'insc-123' })]);
      component.ngOnInit();
    });

    it('should call update with authorizations only', () => {
      component.inscripcionForm.patchValue({ declaracionDeSalud: true });

      component.onSubmit();

      expect(mockStateService.update).toHaveBeenCalledWith(
        'insc-123',
        expect.objectContaining({ declaracionDeSalud: true }),
      );
    });

    it('should navigate after successful update', () => {
      component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/inscripciones']);
    });
  });

  describe('Cuenta personal', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should load saldo when a persona is selected', () => {
      mockCajasApi.getSaldoCuentaPersonal.mockReturnValue(of(7000));

      component.inscripcionForm.get('personaId')?.setValue('persona-1');

      expect(mockCajasApi.getSaldoCuentaPersonal).toHaveBeenCalledWith('persona-1');
      expect(component.saldoCuentaPersonal()).toBe(7000);
    });

    it('should cap usarSaldoDisponible at montoTotal', () => {
      component.saldoCuentaPersonal.set(MONTO_SCOUT_ARGENTINA + 5000);

      component.usarSaldoDisponible();

      expect(component.inscripcionForm.get('montoConSaldoPersonal')?.value).toBe(
        MONTO_SCOUT_ARGENTINA,
      );
    });
  });

  describe('Cancel Action', () => {
    it('should navigate back on cancel', () => {
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/inscripciones']);
    });
  });
});
