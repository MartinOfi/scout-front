/**
 * EventoFormComponent Tests
 * Smart component del alta/edición de eventos.
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { Observable, of } from 'rxjs';

import { EventoFormComponent } from './evento-form.component';
import { EventosStateService } from '../../services/eventos-state.service';
import { EventosFormBuilder } from '../../services/eventos-form.builder';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { TipoEvento, ModalidadVenta, DestinoGanancia } from '../../../../shared/enums';
import { Evento } from '../../../../shared/models';
import { MockRouter, createMockRouter } from '../../../../shared/testing/common-mocks';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

interface MockEventosStateService {
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  selected: WritableSignal<Evento | null>;
  loadById: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
}

/**
 * El mock compartido (createMockConfirmDialogService) devuelve Promises y no
 * coincide con la API real del servicio, que devuelve Observables. Se usa uno
 * local hasta que ese helper se ponga al día.
 */
interface MockConfirmDialog {
  confirm: ReturnType<typeof vi.fn>;
}

function makeEvento(overrides: Partial<Evento> = {}): Evento {
  return {
    id: 'evt-1',
    nombre: 'Bazar Primavera',
    tipo: TipoEvento.VENTA,
    fecha: '2026-06-15',
    descripcion: 'Descripción test',
    destinoGanancia: DestinoGanancia.CUENTAS_PERSONALES,
    modalidadVenta: ModalidadVenta.UNICA,
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
  let mockState: MockEventosStateService;
  let mockRouter: MockRouter;
  let mockConfirmDialog: MockConfirmDialog;

  /**
   * Monta el componente. `eventoId` null = modo alta; con id = modo edición.
   */
  async function mountComponent(eventoId: string | null): Promise<void> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [EventoFormComponent],
      providers: [
        EventosFormBuilder,
        { provide: EventosStateService, useValue: mockState },
        { provide: Router, useValue: mockRouter },
        { provide: ConfirmDialogService, useValue: mockConfirmDialog },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => eventoId } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    mockState = {
      loading: signal(false),
      error: signal<string | null>(null),
      selected: signal<Evento | null>(null),
      loadById: vi.fn(),
      create: vi.fn().mockReturnValue(of(makeEvento())),
      update: vi.fn().mockReturnValue(of(makeEvento())),
    };
    mockRouter = createMockRouter();
    mockConfirmDialog = { confirm: vi.fn().mockReturnValue(of(true)) };

    await mountComponent(null);
  });

  // ─── Creation ──────────────────────────────────────────────────────────────

  describe('Component creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should expose form', () => {
      expect(component.form).toBeDefined();
    });

    it('should default to create mode (isEditing = false)', () => {
      expect(component.isEditing()).toBe(false);
    });
  });

  // ─── Form structure ────────────────────────────────────────────────────────

  describe('Form structure', () => {
    it('should be invalid when nombre is empty', () => {
      component.form.get('nombre')!.setValue('');
      component.form.markAllAsTouched();
      expect(component.form.invalid).toBe(true);
    });

    it('should be valid with required fields filled', () => {
      component.form.patchValue({
        nombre: 'Evento Scout',
        tipo: TipoEvento.GRUPO,
        fecha: '2026-06-15',
      });
      expect(component.form.valid).toBe(true);
    });
  });

  // ─── Submit ────────────────────────────────────────────────────────────────

  describe('Submit — create mode', () => {
    beforeEach(() => {
      component.form.patchValue({
        nombre: 'Bazar Primavera',
        tipo: TipoEvento.VENTA,
        fecha: '2026-06-15',
      });
    });

    it('should call state.create and navigate to the new evento', () => {
      component.onSubmit();
      expect(mockState.create).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos', 'evt-1']);
    });

    it('should not call create when form is invalid', () => {
      component.form.get('nombre')!.setValue('');
      component.onSubmit();
      expect(mockState.create).not.toHaveBeenCalled();
      expect(component.form.get('nombre')!.touched).toBe(true);
    });
  });

  describe('Submit — edit mode', () => {
    beforeEach(async () => {
      await mountComponent('evt-1');
      component.form.patchValue({
        nombre: 'Bazar Otoño',
        tipo: TipoEvento.VENTA,
        fecha: '2026-09-01',
      });
    });

    it('should be in editing mode and load the evento', () => {
      expect(component.isEditing()).toBe(true);
      expect(mockState.loadById).toHaveBeenCalledWith('evt-1');
    });

    it('should call state.update and navigate on submit', () => {
      component.onSubmit();
      expect(mockState.update).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos', 'evt-1']);
    });

    it('should not call update when form is invalid', () => {
      component.form.get('nombre')!.setValue('');
      component.onSubmit();
      expect(mockState.update).not.toHaveBeenCalled();
    });
  });

  // ─── Effect: form population ───────────────────────────────────────────────

  describe('Effect — form population from selected evento', () => {
    it('should patch form when selected evento changes in edit mode', async () => {
      await mountComponent('evt-1');
      mockState.selected.set(makeEvento({ nombre: 'Evento Patched' }));
      fixture.detectChanges();

      expect(component.form.get('nombre')!.value).toBe('Evento Patched');
    });

    it('should not patch form when not in edit mode', () => {
      mockState.selected.set(makeEvento({ nombre: 'Should Not Patch' }));
      fixture.detectChanges();

      expect(component.form.get('nombre')!.value).not.toBe('Should Not Patch');
    });
  });

  // ─── Modalidad de venta ────────────────────────────────────────────────────

  describe('Modalidad de venta', () => {
    /** Monta en edición con un evento ya cargado en el state. */
    async function mountEditandoEvento(evento: Evento): Promise<void> {
      mockState.selected.set(evento);
      await mountComponent('evt-1');
      fixture.detectChanges();
    }

    it('arranca en única y ofrece el destino del evento', () => {
      expect(component.esMixta()).toBe(false);
      expect(component.mostrarDestinoEvento()).toBe(true);
    });

    it('esconde el destino del evento al elegir mixta', () => {
      component.form.patchValue({ modalidadVenta: ModalidadVenta.MIXTA });

      // Con un computed sobre form.value esto quedaría congelado en true.
      expect(component.esMixta()).toBe(true);
      expect(component.mostrarDestinoEvento()).toBe(false);
    });

    it('refleja la modalidad del evento cargado en edición', async () => {
      await mountEditandoEvento(makeEvento({ modalidadVenta: ModalidadVenta.MIXTA }));

      expect(component.esMixta()).toBe(true);
    });

    it('convierte a mixta cuando se confirma el diálogo', async () => {
      await mountEditandoEvento(makeEvento({ modalidadVenta: ModalidadVenta.UNICA }));

      component.onConvertirAMixta();

      expect(mockConfirmDialog.confirm).toHaveBeenCalled();
      expect(component.form.get('modalidadVenta')!.value).toBe(ModalidadVenta.MIXTA);
      expect(component.esMixta()).toBe(true);
    });

    it('no convierte nada si se cancela el diálogo', async () => {
      mockConfirmDialog.confirm.mockReturnValue(of(false) as Observable<boolean>);
      await mountEditandoEvento(makeEvento({ modalidadVenta: ModalidadVenta.UNICA }));

      component.onConvertirAMixta();

      expect(component.form.get('modalidadVenta')!.value).toBe(ModalidadVenta.UNICA);
      expect(component.esMixta()).toBe(false);
    });

    it('marca la conversión como pendiente hasta que se guarda', async () => {
      await mountEditandoEvento(makeEvento({ modalidadVenta: ModalidadVenta.UNICA }));

      component.onConvertirAMixta();

      expect(component.conversionPendiente()).toBe(true);
    });

    it('no marca pendiente un evento que ya era mixto', async () => {
      await mountEditandoEvento(makeEvento({ modalidadVenta: ModalidadVenta.MIXTA }));

      expect(component.conversionPendiente()).toBe(false);
    });

    it('conserva el destinoGanancia del evento al convertir a mixta', async () => {
      await mountEditandoEvento(
        makeEvento({
          modalidadVenta: ModalidadVenta.UNICA,
          destinoGanancia: DestinoGanancia.CAJA_GRUPO,
        }),
      );

      component.onConvertirAMixta();

      // El backend lo sigue necesitando para la cabecera del reporte: la
      // conversión oculta el campo pero no lo borra.
      expect(component.form.get('destinoGanancia')!.value).toBe(DestinoGanancia.CAJA_GRUPO);
    });
  });

  // ─── Cancel ────────────────────────────────────────────────────────────────

  describe('Cancel', () => {
    it('should navigate to /eventos on cancel in create mode', () => {
      component.onCancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos']);
    });
  });
});
