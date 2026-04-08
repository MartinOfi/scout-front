/**
 * EventoFormComponent Tests
 * Jasmine + Karma — TDD Pattern: RED-GREEN-REFACTOR
 * Coverage target: 90%+
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { signal, Signal } from '@angular/core';
import { of, Subject } from 'rxjs';

import { EventoFormComponent } from './evento-form.component';
import { EventosStateService } from '../../services/eventos-state.service';
import { EventosFormBuilder } from '../../services/eventos-form.builder';
import { TipoEvento } from '../../../../shared/enums';
import { Evento } from '../../../../shared/models';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEvento(overrides: Partial<Evento> = {}): Evento {
  return {
    id: 'evt-1',
    nombre: 'Bazar Primavera',
    tipo: TipoEvento.VENTA,
    fecha: '2026-06-15',
    descripcion: 'Descripción test',
    destinoGanancia: null,
    tipoEvento: null,
    productos: [],
    movimientos: [],
    ...overrides,
  } as unknown as Evento;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EventoFormComponent', () => {
  let component: EventoFormComponent;
  let fixture: ComponentFixture<EventoFormComponent>;
  let mockState: jasmine.SpyObj<EventosStateService> & {
    loading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string | null>>;
    selected: ReturnType<typeof signal<Evento | null>>;
  };
  let mockRouter: jasmine.SpyObj<Router>;
  let paramMapSubject: Subject<{ get: (k: string) => string | null }>;

  beforeEach(async () => {
    const loadingSig = signal(false);
    const errorSig = signal<string | null>(null);
    const selectedSig = signal<Evento | null>(null);

    mockState = jasmine.createSpyObj(
      'EventosStateService',
      ['loadById', 'create', 'update'],
      { loading: loadingSig, error: errorSig, selected: selectedSig },
    ) as typeof mockState;

    mockState.create.and.returnValue(of(makeEvento()));
    mockState.update.and.returnValue(of(makeEvento()));

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRouter.navigate.and.returnValue(Promise.resolve(true));

    paramMapSubject = new Subject();

    await TestBed.configureTestingModule({
      imports: [EventoFormComponent],
      providers: [
        EventosFormBuilder,
        { provide: EventosStateService, useValue: mockState },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creation ───────────────────────────────────────────────────────────────

  describe('Component creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should expose form', () => {
      expect(component.form).toBeDefined();
    });

    it('should expose loading signal from state', () => {
      expect(component.loading).toBe(mockState.loading as Signal<boolean>);
    });

    it('should expose error signal from state', () => {
      expect(component.error).toBe(mockState.error as Signal<string | null>);
    });

    it('should default to create mode (isEditing = false)', () => {
      expect(component.isEditing()).toBeFalse();
    });
  });

  // ─── Form structure ──────────────────────────────────────────────────────────

  describe('Form structure', () => {
    it('should have nombre control', () => {
      expect(component.form.get('nombre')).toBeTruthy();
    });

    it('should have tipo control', () => {
      expect(component.form.get('tipo')).toBeTruthy();
    });

    it('should have fecha control', () => {
      expect(component.form.get('fecha')).toBeTruthy();
    });

    it('should have tipoEvento control', () => {
      expect(component.form.get('tipoEvento')).toBeTruthy();
    });

    it('should be invalid when nombre is empty', () => {
      component.form.get('nombre')!.setValue('');
      component.form.markAllAsTouched();
      expect(component.form.invalid).toBeTrue();
    });

    it('should be valid with required fields filled', () => {
      component.form.patchValue({
        nombre: 'Evento Scout',
        tipo: TipoEvento.GRUPO,
        fecha: '2026-06-15',
      });
      expect(component.form.valid).toBeTrue();
    });
  });

  // ─── Options ─────────────────────────────────────────────────────────────────

  describe('Select options', () => {
    it('should expose tipoOptions with VENTA and GRUPO', () => {
      const values = component.tipoOptions.map((o) => o.value);
      expect(values).toContain(TipoEvento.VENTA);
      expect(values).toContain(TipoEvento.GRUPO);
    });

    it('should expose destinoOptions', () => {
      expect(component.destinoOptions.length).toBeGreaterThan(0);
    });
  });

  // ─── Submit (create mode) ────────────────────────────────────────────────────

  describe('Submit — create mode', () => {
    beforeEach(() => {
      component.form.patchValue({
        nombre: 'Bazar Primavera',
        tipo: TipoEvento.VENTA,
        fecha: '2026-06-15',
      });
    });

    it('should call state.create with correct DTO', () => {
      component.onSubmit();
      expect(mockState.create).toHaveBeenCalled();
    });

    it('should navigate to evento detail after creation', () => {
      component.onSubmit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos', 'evt-1']);
    });

    it('should not call create when form is invalid', () => {
      component.form.get('nombre')!.setValue('');
      component.onSubmit();
      expect(mockState.create).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched on invalid submit', () => {
      component.form.get('nombre')!.setValue('');
      component.onSubmit();
      expect(component.form.get('nombre')!.touched).toBeTrue();
    });
  });

  // ─── Submit (edit mode) ───────────────────────────────────────────────────────

  describe('Submit — edit mode', () => {
    beforeEach(async () => {
      // Rebuild with an id in the route
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [EventoFormComponent],
        providers: [
          EventosFormBuilder,
          { provide: EventosStateService, useValue: mockState },
          { provide: Router, useValue: mockRouter },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { paramMap: { get: () => 'evt-1' } } },
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(EventoFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.form.patchValue({
        nombre: 'Bazar Otoño',
        tipo: TipoEvento.VENTA,
        fecha: '2026-09-01',
      });
    });

    it('should be in editing mode', () => {
      expect(component.isEditing()).toBeTrue();
    });

    it('should call state.loadById on init', () => {
      expect(mockState.loadById).toHaveBeenCalledWith('evt-1');
    });

    it('should call state.update on submit', () => {
      component.onSubmit();
      expect(mockState.update).toHaveBeenCalled();
    });

    it('should navigate to evento detail after update', () => {
      component.onSubmit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos', 'evt-1']);
    });

    it('should not call update when form is invalid', () => {
      component.form.get('nombre')!.setValue('');
      component.onSubmit();
      expect(mockState.update).not.toHaveBeenCalled();
    });
  });

  // ─── Effect: form population ─────────────────────────────────────────────────

  describe('Effect — form population from selected evento', () => {
    it('should patch form when selected evento changes in edit mode', () => {
      component.isEditing.set(true);
      const evento = makeEvento({ nombre: 'Evento Patched', fecha: '2026-10-05' });
      mockState.selected.set(evento);
      TestBed.flushEffects();

      expect(component.form.get('nombre')!.value).toBe('Evento Patched');
      expect(component.form.get('fecha')!.value).toBe('2026-10-05');
    });

    it('should not patch form when selected changes but not in edit mode', () => {
      component.isEditing.set(false);
      const evento = makeEvento({ nombre: 'Should Not Patch' });
      mockState.selected.set(evento);
      TestBed.flushEffects();

      expect(component.form.get('nombre')!.value).not.toBe('Should Not Patch');
    });
  });

  // ─── Cancel ──────────────────────────────────────────────────────────────────

  describe('Cancel', () => {
    it('should navigate to /eventos on cancel in create mode', () => {
      component.onCancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos']);
    });
  });
});
