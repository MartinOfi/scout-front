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
import { PersonaType, EstadoPagoCampamento } from '../../../../../shared/enums';

// ─── Mock factories ───────────────────────────────────────────────────────────

function createMockParticipante(
  overrides: Partial<ParticipantePagoDto> = {},
): ParticipantePagoDto {
  return {
    id: 'p-1',
    nombre: 'Test Participante',
    tipo: PersonaType.PROTAGONISTA,
    rama: 'Manada',
    costoPorPersona: 1000,
    totalPagado: 0,
    saldoPendiente: 1000,
    estadoPago: EstadoPagoCampamento.PENDIENTE,
    saldoCuentaPersonal: 0,
    autorizacionEntregada: false,
    pagos: [],
    ...overrides,
  };
}

interface MockStateService {
  detalleInfo: WritableSignal<CampamentoInfoDto | null>;
  detalleKpis: WritableSignal<CampamentoKpisDto | null>;
  detalleParticipantes: WritableSignal<ParticipantePagoDto[]>;
  detalleMovimientos: WritableSignal<MovimientoCampamentoDto[]>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  loadDetalle: ReturnType<typeof vi.fn>;
  addParticipante: ReturnType<typeof vi.fn>;
  registrarPago: ReturnType<typeof vi.fn>;
  updatePago: ReturnType<typeof vi.fn>;
  deletePago: ReturnType<typeof vi.fn>;
  registrarGasto: ReturnType<typeof vi.fn>;
  updateParticipanteAutorizacion: ReturnType<typeof vi.fn>;
}

function buildMockStateService(): MockStateService {
  return {
    detalleInfo: signal<CampamentoInfoDto | null>(null),
    detalleKpis: signal<CampamentoKpisDto | null>(null),
    detalleParticipantes: signal<ParticipantePagoDto[]>([]),
    detalleMovimientos: signal<MovimientoCampamentoDto[]>([]),
    loading: signal<boolean>(false),
    error: signal<string | null>(null),
    loadDetalle: vi.fn(),
    addParticipante: vi.fn().mockReturnValue(of({})),
    registrarPago: vi.fn().mockReturnValue(of({})),
    updatePago: vi.fn().mockReturnValue(of(undefined)),
    deletePago: vi.fn().mockReturnValue(of(undefined)),
    registrarGasto: vi.fn().mockReturnValue(of(undefined)),
    updateParticipanteAutorizacion: vi.fn().mockReturnValue(of(undefined)),
  };
}

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
    expect(mockState.loadDetalle).toHaveBeenCalledWith('camp-1', expect.anything());
  });

  it('should expose loading signal from state', () => {
    expect(component.loading).toBe(mockState.loading as unknown as typeof component.loading);
  });

  it('should expose error signal from state', () => {
    expect(component.error).toBe(mockState.error as unknown as typeof component.error);
  });

  // ─── Participant filter signals ─────────────────────────────────────────────

  describe('participant filters', () => {
    const MOCK_PARTICIPANTS: ParticipantePagoDto[] = [
      createMockParticipante({ id: '1', nombre: 'Juan García', tipo: PersonaType.PROTAGONISTA, rama: 'Manada' }),
      createMockParticipante({ id: '2', nombre: 'Ana Pérez', tipo: PersonaType.PROTAGONISTA, rama: 'Unidad' }),
      createMockParticipante({ id: '3', nombre: 'Carlos Rodríguez', tipo: PersonaType.EDUCADOR, rama: undefined }),
      createMockParticipante({ id: '4', nombre: 'Juan Martínez', tipo: PersonaType.PROTAGONISTA, rama: 'Rovers' }),
      createMockParticipante({ id: '5', nombre: 'Laura Sánchez', tipo: PersonaType.EDUCADOR, rama: undefined }),
    ];

    beforeEach(() => {
      mockState.detalleParticipantes.set(MOCK_PARTICIPANTS);
      fixture.detectChanges();
    });

    describe('filtroNombreParticipantes', () => {
      it('defaults to empty string', () => {
        expect(component.filtroNombreParticipantes()).toBe('');
      });
    });

    describe('filtroRamaParticipantes', () => {
      it('defaults to todos', () => {
        expect(component.filtroRamaParticipantes()).toBe('todos');
      });
    });

    describe('participantesFiltrados', () => {
      it('returns all participants when no filters are active', () => {
        expect(component.participantesFiltrados().length).toBe(5);
      });

      it('filters by nombre case-insensitively', () => {
        component.filtroNombreParticipantes.set('juan');
        const result = component.participantesFiltrados();
        expect(result.length).toBe(2);
        expect(result.map((p) => p.nombre)).toEqual(
          expect.arrayContaining(['Juan García', 'Juan Martínez']),
        );
      });

      it('filters by nombre partial match', () => {
        component.filtroNombreParticipantes.set('Garc');
        const result = component.participantesFiltrados();
        expect(result.length).toBe(1);
        expect(result[0].nombre).toBe('Juan García');
      });

      it('filters by Rama value', () => {
        component.filtroRamaParticipantes.set('Manada');
        const result = component.participantesFiltrados();
        expect(result.length).toBe(1);
        expect(result[0].nombre).toBe('Juan García');
      });

      it('educador filter returns only educadores regardless of rama field', () => {
        component.filtroRamaParticipantes.set('educador');
        const result = component.participantesFiltrados();
        expect(result.length).toBe(2);
        expect(result.every((p) => p.tipo === PersonaType.EDUCADOR)).toBe(true);
      });

      it('combines nombre and rama filters', () => {
        component.filtroNombreParticipantes.set('juan');
        component.filtroRamaParticipantes.set('Rovers');
        const result = component.participantesFiltrados();
        expect(result.length).toBe(1);
        expect(result[0].nombre).toBe('Juan Martínez');
      });

      it('combines nombre filter with educador filter', () => {
        component.filtroNombreParticipantes.set('carlos');
        component.filtroRamaParticipantes.set('educador');
        const result = component.participantesFiltrados();
        expect(result.length).toBe(1);
        expect(result[0].nombre).toBe('Carlos Rodríguez');
      });

      it('returns empty array when no participants match the filter', () => {
        component.filtroNombreParticipantes.set('XYZ_NO_MATCH');
        expect(component.participantesFiltrados().length).toBe(0);
      });

      it('resets to full list when nombre filter is cleared', () => {
        component.filtroNombreParticipantes.set('juan');
        expect(component.participantesFiltrados().length).toBe(2);
        component.filtroNombreParticipantes.set('');
        expect(component.participantesFiltrados().length).toBe(5);
      });

      it('resets to full list when rama filter returns to todos', () => {
        component.filtroRamaParticipantes.set('Unidad');
        expect(component.participantesFiltrados().length).toBe(1);
        component.filtroRamaParticipantes.set('todos');
        expect(component.participantesFiltrados().length).toBe(5);
      });
    });
  });
});
