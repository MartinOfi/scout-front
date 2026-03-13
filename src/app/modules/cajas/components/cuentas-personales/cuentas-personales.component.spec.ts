/**
 * CuentasPersonalesComponent Tests
 * Tests smart component behavior for cuentas personales view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';

import { CuentasPersonalesComponent } from './cuentas-personales.component';
import { CajasStateService } from '../../services/cajas-state.service';
import { CajaConSaldo } from '../../../../shared/models';
import { CajaType, RamaEnum } from '../../../../shared/enums';
import { ActionEvent, TableData } from '../../../../shared/models/table.model';

describe('CuentasPersonalesComponent', () => {
  let component: CuentasPersonalesComponent;
  let fixture: ComponentFixture<CuentasPersonalesComponent>;
  let mockCajasStateService: ReturnType<typeof createMockCajasStateService>;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  function createMockCajasStateService() {
    return {
      loading: signal<boolean>(false),
      cajasPersonales: signal<CajaConSaldo[]>([]),
      loadCajasPersonales: vi.fn(),
    };
  }

  function createMockCajaConSaldo(overrides: Partial<CajaConSaldo> = {}): CajaConSaldo {
    return {
      id: 'caja-1',
      tipo: CajaType.PERSONAL,
      nombre: null,
      propietarioId: 'p-1',
      propietario: { id: 'p-1', nombre: 'Juan Perez' },
      saldoActual: 1000,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    mockCajasStateService = createMockCajasStateService();

    await TestBed.configureTestingModule({
      imports: [CuentasPersonalesComponent],
      providers: [
        { provide: CajasStateService, useValue: mockCajasStateService },
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

    it('should call cajasState.loadCajasPersonales on ngOnInit', () => {
      component.ngOnInit();
      expect(mockCajasStateService.loadCajasPersonales).toHaveBeenCalledTimes(1);
    });

    it('should expose loading signal from cajas state', () => {
      expect(component.loading).toBe(mockCajasStateService.loading);
    });
  });

  describe('Table Data Computed Signal', () => {
    it('should compute tableData from cajasPersonales', () => {
      const mockCajas = [
        createMockCajaConSaldo({
          id: 'caja-1',
          propietarioId: 'p-1',
          propietario: { id: 'p-1', nombre: 'Juan Perez' },
          saldoActual: 1000,
        }),
        createMockCajaConSaldo({
          id: 'caja-2',
          propietarioId: 'p-2',
          propietario: { id: 'p-2', nombre: 'Maria Lopez' },
          saldoActual: 2000,
        }),
      ];

      mockCajasStateService.cajasPersonales.set(mockCajas);

      const tableData = component.tableData();

      expect(tableData.length).toBe(2);
      expect(tableData[0]['id']).toBe('caja-1');
      expect(tableData[0]['nombre']).toBe('Juan Perez');
      expect(tableData[0]['saldo']).toBe(1000);
      expect(tableData[0]['propietarioId']).toBe('p-1');
    });

    it('should handle empty cajasPersonales list', () => {
      mockCajasStateService.cajasPersonales.set([]);

      expect(component.tableData().length).toBe(0);
    });

    it('should update tableData when cajasPersonales signal changes', () => {
      const cajas1 = [createMockCajaConSaldo({ id: 'caja-1' })];
      const cajas2 = [
        createMockCajaConSaldo({ id: 'caja-1' }),
        createMockCajaConSaldo({ id: 'caja-2' }),
      ];

      mockCajasStateService.cajasPersonales.set(cajas1);
      expect(component.tableData().length).toBe(1);

      mockCajasStateService.cajasPersonales.set(cajas2);
      expect(component.tableData().length).toBe(2);
    });

    it('should use caja.nombre as fallback when propietario is null', () => {
      const mockCajas = [
        createMockCajaConSaldo({
          id: 'caja-1',
          propietario: null,
          propietarioId: null,
          nombre: 'Cuenta Sin Propietario',
        }),
      ];

      mockCajasStateService.cajasPersonales.set(mockCajas);

      const tableData = component.tableData();
      expect(tableData[0]['nombre']).toBe('Cuenta Sin Propietario');
    });

    it('should display dash when propietario and nombre are null', () => {
      const mockCajas = [
        createMockCajaConSaldo({
          id: 'caja-1',
          propietario: null,
          propietarioId: null,
          nombre: null,
        }),
      ];

      mockCajasStateService.cajasPersonales.set(mockCajas);

      const tableData = component.tableData();
      expect(tableData[0]['nombre']).toBe('-');
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
        row: { id: 'caja-123' } as TableData,
      };

      component.onActionClick(event);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos'], {
        queryParams: { cajaId: 'caja-123', tipo: 'personal' },
      });
    });

    it('should navigate to nuevo movimiento on register action', () => {
      const event: ActionEvent = {
        action: 'register',
        row: { id: 'caja-456' } as TableData,
      };

      component.onActionClick(event);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos/nuevo'], {
        queryParams: { cajaId: 'caja-456', tipo: 'personal' },
      });
    });
  });

  describe('Row Click Handler', () => {
    it('should navigate to persona detail on row click when propietarioId exists', () => {
      const row: TableData = { id: 'caja-789', propietarioId: 'p-789' };

      component.onRowClick(row);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas', 'p-789']);
    });

    it('should not navigate when propietarioId is null', () => {
      const row: TableData = { id: 'caja-789', propietarioId: null };

      component.onRowClick(row);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should not navigate when propietarioId is undefined', () => {
      const row: TableData = { id: 'caja-789' };

      component.onRowClick(row);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should expose loading signal from cajas state service', () => {
      mockCajasStateService.loading.set(true);
      expect(component.loading()).toBe(true);

      mockCajasStateService.loading.set(false);
      expect(component.loading()).toBe(false);
    });
  });

  describe('Component Lifecycle', () => {
    it('should load cajas personales data on initialization', () => {
      component.ngOnInit();
      expect(mockCajasStateService.loadCajasPersonales).toHaveBeenCalled();
    });
  });
});
