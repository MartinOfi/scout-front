/**
 * CampamentoDetailComponent - Unit Tests
 * Smart component - state management, tabs, and participant filtering
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { CampamentoDetailComponent } from './campamento-detail.component';
import { PersonaSelectorDialogResult } from '../../../../../shared/components/persona-selector-dialog/persona-selector-dialog.component';
import { CampamentosStateService } from '../../../services/campamentos-state.service';
import { ConfirmDialogService } from '../../../../../shared';
import { CajasApiService } from '../../../../cajas/services/cajas-api.service';
import { PersonasApiService } from '../../../../personas/services/personas-api.service';
import { MovimientosApiService } from '../../../../movimientos/services/movimientos-api.service';
import {
  ParticipantePagoDto,
  CampamentoInfoDto,
  CampamentoKpisDto,
  MovimientoCampamentoDto,
} from '../../../../../shared/models';
import {
  EstadoPagoCampamento,
  PersonaType,
  ConceptoMovimiento,
  TipoMovimientoEnum,
  MedioPagoEnum,
} from '../../../../../shared/enums';

interface MockStateService {
  detalleInfo: WritableSignal<CampamentoInfoDto | null>;
  detalleKpis: WritableSignal<CampamentoKpisDto | null>;
  detalleParticipantes: WritableSignal<ParticipantePagoDto[]>;
  detalleMovimientos: WritableSignal<MovimientoCampamentoDto[]>;
  loading: WritableSignal<boolean>;
  initialLoading: WritableSignal<boolean>;
  refreshing: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  loadDetalle: ReturnType<typeof vi.fn>;
  clearDetalle: ReturnType<typeof vi.fn>;
  addParticipante: ReturnType<typeof vi.fn>;
  registrarPago: ReturnType<typeof vi.fn>;
  updatePago: ReturnType<typeof vi.fn>;
  deletePago: ReturnType<typeof vi.fn>;
  registrarGasto: ReturnType<typeof vi.fn>;
  removeParticipante: ReturnType<typeof vi.fn>;
  updateParticipanteAutorizacion: ReturnType<typeof vi.fn>;
  bonificarParticipante: ReturnType<typeof vi.fn>;
  quitarBonificacionParticipante: ReturnType<typeof vi.fn>;
}

function buildMockStateService(): MockStateService {
  return {
    detalleInfo: signal<CampamentoInfoDto | null>(null),
    detalleKpis: signal<CampamentoKpisDto | null>(null),
    detalleParticipantes: signal<ParticipantePagoDto[]>([]),
    detalleMovimientos: signal<MovimientoCampamentoDto[]>([]),
    loading: signal<boolean>(false),
    initialLoading: signal<boolean>(false),
    refreshing: signal<boolean>(false),
    error: signal<string | null>(null),
    loadDetalle: vi.fn(),
    clearDetalle: vi.fn(),
    addParticipante: vi.fn().mockReturnValue(of({})),
    registrarPago: vi.fn().mockReturnValue(of({})),
    updatePago: vi.fn().mockReturnValue(of(undefined)),
    deletePago: vi.fn().mockReturnValue(of(undefined)),
    registrarGasto: vi.fn().mockReturnValue(of(undefined)),
    removeParticipante: vi.fn().mockReturnValue(of(undefined)),
    updateParticipanteAutorizacion: vi.fn().mockReturnValue(of(undefined)),
    bonificarParticipante: vi.fn().mockReturnValue(of(undefined)),
    quitarBonificacionParticipante: vi.fn().mockReturnValue(of(undefined)),
  };
}

const mockParticipanteBonificado: ParticipantePagoDto = {
  id: 'edu-2',
  nombre: 'Tito Educador',
  tipo: PersonaType.EDUCADOR,
  montoAsignado: 10000,
  montoBonificado: 4000,
  totalPagado: 6000,
  saldoPendiente: 0,
  estadoPago: EstadoPagoCampamento.PAGADO,
  saldoCuentaPersonal: 0,
  autorizacionEntregada: true,
  pagos: [],
};

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('CampamentoDetailComponent', () => {
  let component: CampamentoDetailComponent;
  let fixture: ComponentFixture<CampamentoDetailComponent>;
  let mockState: MockStateService;

  beforeEach(async () => {
    mockState = buildMockStateService();

    await TestBed.configureTestingModule({
      imports: [CampamentoDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: CampamentosStateService, useValue: mockState },
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: vi.fn().mockReturnValue('camp-1'),
              },
            },
          },
        },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        {
          provide: ConfirmDialogService,
          useValue: {
            confirmDelete: vi.fn().mockReturnValue(of(false)),
            confirmAsync: vi.fn().mockReturnValue(of({ confirmed: false })),
          },
        },
        {
          provide: CajasApiService,
          useValue: { getSaldoCuentaPersonal: vi.fn().mockReturnValue(of(0)) },
        },
        {
          provide: PersonasApiService,
          useValue: { getAll: vi.fn().mockReturnValue(of([])) },
        },
        {
          provide: MovimientosApiService,
          useValue: { update: vi.fn().mockReturnValue(of({})) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CampamentoDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call loadDetalle with the route param id on init', () => {
    fixture.detectChanges();
    expect(mockState.loadDetalle).toHaveBeenCalledWith(
      'camp-1',
      expect.anything(),
      expect.anything(),
    );
  });

  it('should expose loading signal from state', () => {
    expect(component.loading).toBe(mockState.loading as unknown as typeof component.loading);
  });

  it('should expose error signal from state', () => {
    expect(component.error).toBe(mockState.error as unknown as typeof component.error);
  });

  it('muestra el chip Exento para un participante sin monto asignado', () => {
    mockState.detalleInfo.set({
      id: 'camp-1',
      nombre: 'Campamento Verano',
      fechaInicio: new Date('2026-01-15'),
      fechaFin: new Date('2026-01-20'),
      costoPorPersona: 50000,
      costoEducadores: 0,
      cuotasBase: 3,
    });
    mockState.detalleParticipantes.set([
      {
        id: 'edu-1',
        nombre: 'Rosa Educadora',
        tipo: PersonaType.EDUCADOR,
        montoAsignado: 0,
        montoBonificado: 0,
        totalPagado: 0,
        saldoPendiente: 0,
        estadoPago: EstadoPagoCampamento.EXENTO,
        saldoCuentaPersonal: 0,
        autorizacionEntregada: true,
        pagos: [],
      },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Exento');
  });

  it('muestra el monto bonificado cuando el participante no está exento', () => {
    mockState.detalleInfo.set({
      id: 'camp-1',
      nombre: 'Campamento Verano',
      fechaInicio: new Date('2026-01-15'),
      fechaFin: new Date('2026-01-20'),
      costoPorPersona: 50000,
      costoEducadores: 0,
      cuotasBase: 3,
    });
    mockState.detalleParticipantes.set([
      {
        id: 'edu-2',
        nombre: 'Tito Educador',
        tipo: PersonaType.EDUCADOR,
        montoAsignado: 10000,
        montoBonificado: 4000,
        totalPagado: 6000,
        saldoPendiente: 0,
        estadoPago: EstadoPagoCampamento.PAGADO,
        saldoCuentaPersonal: 0,
        autorizacionEntregada: true,
        pagos: [],
      },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Bonificado');
    expect(fixture.nativeElement.textContent).not.toContain('Exento');
  });

  it('el progreso de pago suma totalPagado + montoBonificado, no solo lo efectivamente pagado', () => {
    mockState.detalleInfo.set({
      id: 'camp-1',
      nombre: 'Campamento Verano',
      fechaInicio: new Date('2026-01-15'),
      fechaFin: new Date('2026-01-20'),
      costoPorPersona: 10000,
      costoEducadores: 0,
      cuotasBase: 3,
    });
    mockState.detalleParticipantes.set([
      {
        id: 'prota-1',
        nombre: 'Ramirez, Juan Pablo',
        tipo: PersonaType.PROTAGONISTA,
        montoAsignado: 10000,
        montoBonificado: 5000,
        totalPagado: 0,
        saldoPendiente: 5000,
        estadoPago: EstadoPagoCampamento.PARCIAL,
        saldoCuentaPersonal: 0,
        autorizacionEntregada: false,
        pagos: [],
      },
    ]);
    fixture.detectChanges();

    const paidEl: HTMLElement | null = fixture.nativeElement.querySelector(
      '.participante-card__paid',
    );
    expect(paidEl?.textContent).toContain('5.000');
  });

  it('onQuitarBonificacion llama a quitarBonificacionParticipante con el campamento y el participante actuales', () => {
    mockState.detalleInfo.set({
      id: 'camp-1',
      nombre: 'Campamento Verano',
      fechaInicio: new Date('2026-01-15'),
      fechaFin: new Date('2026-01-20'),
      costoPorPersona: 50000,
      costoEducadores: 0,
      cuotasBase: 3,
    });
    fixture.detectChanges();

    component.onQuitarBonificacion(mockParticipanteBonificado);

    expect(mockState.quitarBonificacionParticipante).toHaveBeenCalledWith('camp-1', 'edu-2');
  });

  it('muestra el botón "Quitar bonificación" sólo cuando el participante tiene un monto bonificado, y dispara la acción al clickear', () => {
    mockState.detalleInfo.set({
      id: 'camp-1',
      nombre: 'Campamento Verano',
      fechaInicio: new Date('2026-01-15'),
      fechaFin: new Date('2026-01-20'),
      costoPorPersona: 50000,
      costoEducadores: 0,
      cuotasBase: 3,
    });
    mockState.detalleParticipantes.set([mockParticipanteBonificado]);
    fixture.detectChanges();

    const appButtons: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.participante-card__actions app-button'),
    );
    const quitarBtn = appButtons.find((el) => el.textContent?.includes('Quitar bonificación'));
    expect(quitarBtn).toBeTruthy();

    quitarBtn!.querySelector('button')!.click();

    expect(mockState.quitarBonificacionParticipante).toHaveBeenCalledWith('camp-1', 'edu-2');
  });

  it('no muestra el botón "Quitar bonificación" para un participante sin bonificación', () => {
    mockState.detalleInfo.set({
      id: 'camp-1',
      nombre: 'Campamento Verano',
      fechaInicio: new Date('2026-01-15'),
      fechaFin: new Date('2026-01-20'),
      costoPorPersona: 50000,
      costoEducadores: 0,
      cuotasBase: 3,
    });
    mockState.detalleParticipantes.set([{ ...mockParticipanteBonificado, montoBonificado: 0 }]);
    fixture.detectChanges();

    const appButtons: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.participante-card__actions app-button'),
    );
    const quitarBtn = appButtons.find((el) => el.textContent?.includes('Quitar bonificación'));
    expect(quitarBtn).toBeUndefined();
  });

  it('muestra los movimientos de bonificación en el historial de pagos, con su concepto y sin botón de editar', () => {
    mockState.detalleInfo.set({
      id: 'camp-1',
      nombre: 'Campamento Verano',
      fechaInicio: new Date('2026-01-15'),
      fechaFin: new Date('2026-01-20'),
      costoPorPersona: 50000,
      costoEducadores: 0,
      cuotasBase: 3,
    });
    mockState.detalleParticipantes.set([
      {
        ...mockParticipanteBonificado,
        pagos: [
          {
            movimientoId: 'mov-pago',
            fecha: new Date('2026-01-10'),
            monto: 6000,
            medioPago: MedioPagoEnum.EFECTIVO,
            tipo: TipoMovimientoEnum.INGRESO,
            concepto: ConceptoMovimiento.CAMPAMENTO_PAGO,
          },
          {
            movimientoId: 'mov-bon-otorgada',
            fecha: new Date('2026-01-11'),
            monto: 4000,
            medioPago: MedioPagoEnum.EFECTIVO,
            tipo: TipoMovimientoEnum.EGRESO,
            concepto: ConceptoMovimiento.BONIFICACION_OTORGADA,
          },
        ],
      },
    ]);
    fixture.detectChanges();

    const rows: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.payment-row'));
    expect(rows).toHaveLength(2);

    const pagoRow = rows.find((r) => r.textContent?.includes('Pago de Campamento'));
    const bonRow = rows.find((r) => r.textContent?.includes('Bonificación Otorgada'));
    expect(pagoRow).toBeTruthy();
    expect(bonRow).toBeTruthy();

    expect(pagoRow!.querySelector('.payment-row__edit')).toBeTruthy();
    expect(bonRow!.querySelector('.payment-row__edit')).toBeNull();
  });

  describe('onAddParticipante', () => {
    let mockDialogRef: { afterClosed: ReturnType<typeof vi.fn> };
    const nuevaPersona = {
      id: 'prota-9',
      tipo: PersonaType.PROTAGONISTA,
    } as PersonaSelectorDialogResult['persona'];

    beforeEach(() => {
      mockState.detalleInfo.set({
        id: 'camp-1',
        nombre: 'Campamento Verano',
        fechaInicio: new Date('2026-01-15'),
        fechaFin: new Date('2026-01-20'),
        costoPorPersona: 50000,
        costoEducadores: 0,
        cuotasBase: 3,
      });
      fixture.detectChanges();

      mockDialogRef = { afterClosed: vi.fn() };
      vi.spyOn(
        component as unknown as { openPersonaSelectorDialog: () => unknown },
        'openPersonaSelectorDialog',
      ).mockReturnValue(of(mockDialogRef));
    });

    it('no bonifica ni recarga si el diálogo se cierra sin resultado', () => {
      mockDialogRef.afterClosed.mockReturnValue(of(undefined));

      component.onAddParticipante();

      expect(mockState.addParticipante).not.toHaveBeenCalled();
      expect(mockState.bonificarParticipante).not.toHaveBeenCalled();
    });

    it('agrega el participante sin bonificar cuando no se ingresó monto', () => {
      const result: PersonaSelectorDialogResult = { persona: nuevaPersona };
      mockDialogRef.afterClosed.mockReturnValue(of(result));
      mockState.loadDetalle.mockClear();

      component.onAddParticipante();

      expect(mockState.addParticipante).toHaveBeenCalledWith('camp-1', {
        personaId: 'prota-9',
        autorizacionEntregada: false,
      });
      expect(mockState.bonificarParticipante).not.toHaveBeenCalled();
      expect(mockState.loadDetalle).toHaveBeenCalledTimes(1);
    });

    it('agrega el participante y lo bonifica antes de recargar el detalle cuando se ingresó un monto', () => {
      const result: PersonaSelectorDialogResult = {
        persona: nuevaPersona,
        montoBonificado: 4000,
      };
      mockDialogRef.afterClosed.mockReturnValue(of(result));
      mockState.loadDetalle.mockClear();

      const callOrder: string[] = [];
      mockState.bonificarParticipante.mockImplementation(() => {
        callOrder.push('bonificarParticipante');
        return of(undefined);
      });
      mockState.loadDetalle.mockImplementation(() => {
        callOrder.push('loadDetalle');
      });

      component.onAddParticipante();

      expect(mockState.addParticipante).toHaveBeenCalledWith('camp-1', {
        personaId: 'prota-9',
        autorizacionEntregada: false,
      });
      expect(mockState.bonificarParticipante).toHaveBeenCalledWith('camp-1', 'prota-9', 4000);
      expect(callOrder).toEqual(['bonificarParticipante', 'loadDetalle']);
    });
  });
});
