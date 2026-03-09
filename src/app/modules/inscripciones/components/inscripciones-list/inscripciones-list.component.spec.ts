/**
 * InscripcionesListComponent Tests
 * Tests smart component behavior for inscripciones list view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { InscripcionesListComponent } from './inscripciones-list.component';
import { InscripcionesStateService } from '../../services/inscripciones-state.service';
import { Inscripcion, InscripcionConEstado } from '../../../../shared/models';
import { TipoInscripcion } from '../../../../shared/enums';
import { MockRouter } from '../../../../shared/testing/common-mocks';

interface MockInscripcionesStateService {
  inscripciones: ReturnType<typeof signal<Inscripcion[]>>;
  inscripcionesGrupo: ReturnType<typeof signal<Inscripcion[]>>;
  inscripcionesScoutArgentina: ReturnType<typeof signal<Inscripcion[]>>;
  loading: ReturnType<typeof signal<boolean>>;
  error: ReturnType<typeof signal<string | null>>;
  selectedDetail: ReturnType<typeof signal<InscripcionConEstado | null>>;
  load: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

describe('InscripcionesListComponent', () => {
  let component: InscripcionesListComponent;
  let fixture: ComponentFixture<InscripcionesListComponent>;
  let mockStateService: MockInscripcionesStateService;
  let mockRouter: MockRouter;

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

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    mockStateService = {
      inscripciones: signal<Inscripcion[]>([]),
      inscripcionesGrupo: signal<Inscripcion[]>([]),
      inscripcionesScoutArgentina: signal<Inscripcion[]>([]),
      loading: signal<boolean>(false),
      error: signal<string | null>(null),
      selectedDetail: signal<InscripcionConEstado | null>(null),
      load: vi.fn(),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [InscripcionesListComponent],
      providers: [
        { provide: InscripcionesStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InscripcionesListComponent);
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
    });

    it('should expose signals from state service', () => {
      expect(component.inscripciones).toBe(mockStateService.inscripciones);
      expect(component.loading).toBe(mockStateService.loading);
      expect(component.error).toBe(mockStateService.error);
    });

    it('should call state.load on ngOnInit with default tipo', () => {
      component.ngOnInit();
      expect(mockStateService.load).toHaveBeenCalledWith({ tipo: 'scout_argentina' });
    });

    it('should have default activeTab set to scout_argentina', () => {
      expect(component.activeTab()).toBe('scout_argentina');
    });
  });

  describe('Tab Handling', () => {
    it('should have tabs configured for both tipos', () => {
      expect(component.tabs.length).toBe(2);
      expect(component.tabs[0].key).toBe('scout_argentina');
      expect(component.tabs[1].key).toBe('grupo');
    });

    it('should change activeTab on onTabChange', () => {
      component.onTabChange('grupo');
      expect(component.activeTab()).toBe('grupo');
    });

    it('should reload inscripciones when tab changes', fakeAsync(() => {
      component.onTabChange('grupo');
      tick();
      expect(mockStateService.load).toHaveBeenCalledWith({ tipo: 'grupo' });
    }));
  });

  describe('Inscripciones Signal Handling', () => {
    it('should expose inscripciones signal from state service', () => {
      const mockInscripciones: Inscripcion[] = [
        createMockInscripcion({ id: '1' }),
        createMockInscripcion({ id: '2' }),
      ];

      mockStateService.inscripciones.set(mockInscripciones);
      TestBed.flushEffects();

      expect(component.inscripciones()).toEqual(mockInscripciones);
      expect(component.inscripciones().length).toBe(2);
    });

    it('should filter inscripciones by active tab tipo', () => {
      const mockInscripciones: Inscripcion[] = [
        createMockInscripcion({ id: '1', tipo: 'scout_argentina' }),
        createMockInscripcion({ id: '2', tipo: 'grupo' }),
      ];

      mockStateService.inscripciones.set(mockInscripciones);
      component.activeTab.set('scout_argentina');
      TestBed.flushEffects();

      expect(component.filteredInscripciones().length).toBe(1);
      expect(component.filteredInscripciones()[0].id).toBe('1');
    });

    it('should handle empty inscripciones list', () => {
      mockStateService.inscripciones.set([]);
      TestBed.flushEffects();

      expect(component.inscripciones().length).toBe(0);
      expect(component.filteredInscripciones().length).toBe(0);
    });
  });

  describe('Table Data Mapping', () => {
    it('should map inscripciones to table rows', () => {
      const mockInscripciones: Inscripcion[] = [
        createMockInscripcion({
          id: '1',
          tipo: 'scout_argentina',
          montoTotal: 15000,
          montoBonificado: 5000,
        }),
      ];

      mockStateService.inscripciones.set(mockInscripciones);
      component.activeTab.set('scout_argentina');
      TestBed.flushEffects();

      const tableData = component.tableData();
      expect(tableData.length).toBe(1);
      expect(tableData[0].id).toBe('1');
      expect(tableData[0].montoTotal).toBe('$15.000');
      expect(tableData[0].montoBonificado).toBe('$5.000');
      expect(tableData[0].montoAPagar).toBe('$10.000');
    });

    it('should show dash for zero bonificado', () => {
      const mockInscripciones: Inscripcion[] = [
        createMockInscripcion({ id: '1', tipo: 'scout_argentina', montoBonificado: 0 }),
      ];

      mockStateService.inscripciones.set(mockInscripciones);
      component.activeTab.set('scout_argentina');
      TestBed.flushEffects();

      const tableData = component.tableData();
      expect(tableData[0].montoBonificado).toBe('-');
    });
  });

  describe('Stats Computed', () => {
    it('should calculate stats from filtered inscripciones', () => {
      const mockInscripciones: Inscripcion[] = [
        createMockInscripcion({ id: '1', tipo: 'scout_argentina', montoTotal: 15000, montoBonificado: 0 }),
        createMockInscripcion({ id: '2', tipo: 'scout_argentina', montoTotal: 15000, montoBonificado: 5000 }),
      ];

      mockStateService.inscripciones.set(mockInscripciones);
      component.activeTab.set('scout_argentina');
      TestBed.flushEffects();

      const stats = component.stats();
      expect(stats.length).toBe(2);
      expect(stats[0].value).toBe(2); // Total inscripciones
      expect(stats[1].value).toBe(25000); // Monto esperado (15000 + 10000)
    });
  });

  describe('Filter Change Handling', () => {
    it('should handle filter change', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      const filtros = { search: 'Juan', ano: '2026' };

      component.onFilterChange(filtros);

      expect(consoleSpy).toHaveBeenCalledWith('Filter changed:', filtros);
      consoleSpy.mockRestore();
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate to crear on onCreate', () => {
      component.onCreate();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/inscripciones/crear']);
    });

    it('should navigate to edit on onEdit', () => {
      component.onEdit('insc-123');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/inscripciones', 'insc-123', 'editar']);
    });

    it('should navigate to detail on onSelect', () => {
      component.onSelect('insc-456');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/inscripciones', 'insc-456']);
    });
  });

  describe('Delete Action', () => {
    it('should call state.delete on onDelete with confirmation', fakeAsync(() => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockStateService.delete.mockReturnValue(of(undefined));

      component.onDelete('insc-123');
      tick();

      expect(mockStateService.delete).toHaveBeenCalledWith('insc-123');
    }));

    it('should not delete if user cancels confirmation', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      component.onDelete('insc-123');

      expect(mockStateService.delete).not.toHaveBeenCalled();
    });
  });

  describe('Action Click Handler', () => {
    it('should handle view action', () => {
      const navigateSpy = vi.spyOn(component, 'onSelect');

      component.onActionClick({ action: 'view', row: { id: 'insc-1' } });

      expect(navigateSpy).toHaveBeenCalledWith('insc-1');
    });

    it('should handle edit action', () => {
      const editSpy = vi.spyOn(component, 'onEdit');

      component.onActionClick({ action: 'edit', row: { id: 'insc-1' } });

      expect(editSpy).toHaveBeenCalledWith('insc-1');
    });

    it('should handle delete action', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const deleteSpy = vi.spyOn(component, 'onDelete');

      component.onActionClick({ action: 'delete', row: { id: 'insc-1' } });

      expect(deleteSpy).toHaveBeenCalledWith('insc-1');
    });
  });

  describe('Loading and Error States', () => {
    it('should expose loading signal', () => {
      mockStateService.loading.set(true);
      TestBed.flushEffects();

      expect(component.loading()).toBe(true);

      mockStateService.loading.set(false);
      TestBed.flushEffects();

      expect(component.loading()).toBe(false);
    });

    it('should expose error signal', () => {
      const errorMsg = 'Failed to load inscripciones';
      mockStateService.error.set(errorMsg);
      TestBed.flushEffects();

      expect(component.error()).toBe(errorMsg);

      mockStateService.error.set(null);
      TestBed.flushEffects();

      expect(component.error()).toBeNull();
    });
  });
});
