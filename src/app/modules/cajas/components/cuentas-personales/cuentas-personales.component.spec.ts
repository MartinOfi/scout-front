/**
 * CuentasPersonalesComponent Tests
 * Tests smart component behavior for cuentas personales view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

import { CuentasPersonalesComponent } from './cuentas-personales.component';
import { CajasStateService } from '../../services/cajas-state.service';
import { PersonasStateService } from '../../../personas/services/personas-state.service';
import { Protagonista } from '../../../../shared/models';
import { PersonaType, EstadoPersona, RamaEnum } from '../../../../shared/enums';
import { ActionEvent, TableData } from '../../../../shared/models/table.model';

describe('CuentasPersonalesComponent', () => {
  let component: CuentasPersonalesComponent;
  let fixture: ComponentFixture<CuentasPersonalesComponent>;
  let mockCajasStateService: ReturnType<typeof createMockCajasStateService>;
  let mockPersonasStateService: ReturnType<typeof createMockPersonasStateService>;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  function createMockCajasStateService() {
    return {
      loading: signal<boolean>(false),
      movimientosPersonal: signal<Record<string, unknown>>({}),
    };
  }

  function createMockPersonasStateService() {
    return {
      protagonistas: signal<Protagonista[]>([]),
      load: vi.fn(),
    };
  }

  function createMockProtagonista(overrides: Partial<Protagonista> = {}): Protagonista {
    return {
      id: 'p-1',
      nombre: 'Juan',
      apellido: 'Perez',
      tipo: PersonaType.PROTAGONISTA,
      estado: EstadoPersona.ACTIVO,
      rama: RamaEnum.MANADA,
      fechaIngreso: '2024-01-01',
      fueBonificado: false,
      partidaNacimiento: false,
      dni: false,
      dniPadres: false,
      carnetObraSocial: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      deletedAt: null,
      ...overrides,
    } as Protagonista;
  }

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    mockCajasStateService = createMockCajasStateService();
    mockPersonasStateService = createMockPersonasStateService();

    await TestBed.configureTestingModule({
      imports: [CuentasPersonalesComponent],
      providers: [
        { provide: CajasStateService, useValue: mockCajasStateService },
        { provide: PersonasStateService, useValue: mockPersonasStateService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CuentasPersonalesComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should call personasState.load on ngOnInit', () => {
      component.ngOnInit();
      expect(mockPersonasStateService.load).toHaveBeenCalledTimes(1);
    });

    it('should expose loading signal from cajas state', () => {
      expect(component.loading).toBe(mockCajasStateService.loading);
    });
  });

  describe('Table Data Computed Signal', () => {
    it('should compute tableData from protagonistas', () => {
      const mockPersonas = [
        createMockProtagonista({ id: 'p-1', nombre: 'Juan', rama: RamaEnum.MANADA }),
        createMockProtagonista({ id: 'p-2', nombre: 'Maria', rama: RamaEnum.UNIDAD }),
      ];

      mockPersonasStateService.protagonistas.set(mockPersonas);
      TestBed.flushEffects();

      const tableData = component.tableData();

      expect(tableData.length).toBe(2);
      expect(tableData[0]['id']).toBe('p-1');
      expect(tableData[0]['nombre']).toBe('Juan');
      expect(tableData[0]['rama']).toBe(RamaEnum.MANADA);
    });

    it('should handle empty protagonistas list', () => {
      mockPersonasStateService.protagonistas.set([]);
      TestBed.flushEffects();

      expect(component.tableData().length).toBe(0);
    });

    it('should update tableData when protagonistas signal changes', () => {
      const personas1 = [createMockProtagonista({ id: 'p-1' })];
      const personas2 = [
        createMockProtagonista({ id: 'p-1' }),
        createMockProtagonista({ id: 'p-2' }),
      ];

      mockPersonasStateService.protagonistas.set(personas1);
      TestBed.flushEffects();
      expect(component.tableData().length).toBe(1);

      mockPersonasStateService.protagonistas.set(personas2);
      TestBed.flushEffects();
      expect(component.tableData().length).toBe(2);
    });
  });

  describe('Table Columns', () => {
    it('should have required table columns', () => {
      expect(component.tableColumns.length).toBe(4);

      const columnKeys = component.tableColumns.map((c) => c.key);
      expect(columnKeys).toContain('nombre');
      expect(columnKeys).toContain('rama');
      expect(columnKeys).toContain('saldo');
      expect(columnKeys).toContain('actions');
    });

    it('should have sortable columns configured', () => {
      const nombreCol = component.tableColumns.find((c) => c.key === 'nombre');
      const ramaCol = component.tableColumns.find((c) => c.key === 'rama');
      const saldoCol = component.tableColumns.find((c) => c.key === 'saldo');

      expect(nombreCol?.sortable).toBe(true);
      expect(ramaCol?.sortable).toBe(true);
      expect(saldoCol?.sortable).toBe(true);
    });

    it('should have actions column with proper actions', () => {
      const actionsCol = component.tableColumns.find((c) => c.key === 'actions');

      expect(actionsCol?.type).toBe('action');
      expect(actionsCol?.actions?.length).toBe(2);
      expect(actionsCol?.actions?.map((a) => a.key)).toContain('movements');
      expect(actionsCol?.actions?.map((a) => a.key)).toContain('register');
    });
  });

  describe('Action Click Handler', () => {
    it('should navigate to movimientos on movements action', () => {
      const event: ActionEvent = {
        action: 'movements',
        row: { id: 'p-123' } as TableData,
      };

      component.onActionClick(event);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos'], {
        queryParams: { personaId: 'p-123', tipo: 'personal' },
      });
    });

    it('should navigate to nuevo movimiento on register action', () => {
      const event: ActionEvent = {
        action: 'register',
        row: { id: 'p-456' } as TableData,
      };

      component.onActionClick(event);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos/nuevo'], {
        queryParams: { personaId: 'p-456', tipo: 'personal' },
      });
    });
  });

  describe('Row Click Handler', () => {
    it('should navigate to persona detail on row click', () => {
      const row: TableData = { id: 'p-789' };

      component.onRowClick(row);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas', 'p-789']);
    });
  });

  describe('Loading States', () => {
    it('should expose loading signal from cajas state service', () => {
      mockCajasStateService.loading.set(true);
      TestBed.flushEffects();
      expect(component.loading()).toBe(true);

      mockCajasStateService.loading.set(false);
      TestBed.flushEffects();
      expect(component.loading()).toBe(false);
    });
  });

  describe('Component Lifecycle', () => {
    it('should load personas data on initialization', () => {
      component.ngOnInit();
      expect(mockPersonasStateService.load).toHaveBeenCalled();
    });
  });
});
