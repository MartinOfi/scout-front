/**
 * EventoDetailComponent Tests
 * Jasmine + Karma — TDD Pattern: RED-GREEN-REFACTOR
 * Coverage target: 90%+
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { EventoDetailComponent } from './evento-detail.component';
import { EventosStateService } from '../../services/eventos-state.service';
import { TipoEvento } from '../../../../shared/enums';
import { Evento, EventoKpis, Producto, VentaProducto } from '../../../../shared/models';

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
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  } as Evento;
}

function makeKpis(overrides: Partial<EventoKpis> = {}): EventoKpis {
  return {
    totalRecaudado: 5000,
    gananciaVentas: 2000,
    totalGastado: 1000,
    totalPendienteReembolso: 500,
    balance: 4000,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Mock state factory
// ---------------------------------------------------------------------------

function createMockState() {
  return {
    selected: signal<Evento | null>(null),
    loading: signal<boolean>(false),
    error: signal<string | null>(null),
    kpis: signal<Record<string, EventoKpis>>({}),
    productos: signal<Record<string, Producto[]>>({}),
    ventas: signal<Record<string, VentaProducto[]>>({}),
    movimientos: signal<Record<string, unknown[]>>({}),
    loadById: jasmine.createSpy('loadById'),
    loadKpis: jasmine.createSpy('loadKpis'),
    loadProductos: jasmine.createSpy('loadProductos'),
    /**
     * loadVentas now returns a cold Observable (the component pipes it
     * through switchMap), so the spy must return an observable too —
     * a bare jasmine spy returns undefined and would crash on .subscribe().
     */
    loadVentas: jasmine.createSpy('loadVentas').and.returnValue(of([])),
    loadMovimientos: jasmine.createSpy('loadMovimientos'),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EventoDetailComponent', () => {
  let component: EventoDetailComponent;
  let fixture: ComponentFixture<EventoDetailComponent>;
  let mockState: ReturnType<typeof createMockState>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockState = createMockState();
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRouter.navigate.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [EventoDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: EventosStateService, useValue: mockState },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'evt-1' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creation ────────────────────────────────────────────────────────────────

  describe('Component creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should expose loading signal from state', () => {
      expect(component.loading).toBe(mockState.loading as ReturnType<typeof signal<boolean>>);
    });

    it('should expose error signal from state', () => {
      expect(component.error).toBe(mockState.error as ReturnType<typeof signal<string | null>>);
    });
  });

  // ─── ngOnInit — data loading ──────────────────────────────────────────────

  describe('ngOnInit — data loading', () => {
    it('should call loadById on init', () => {
      expect(mockState.loadById).toHaveBeenCalledWith('evt-1');
    });

    it('should call loadKpis on init', () => {
      expect(mockState.loadKpis).toHaveBeenCalledWith('evt-1');
    });

    it('should call loadProductos and loadVentas for VENTA evento', () => {
      expect(mockState.loadProductos).toHaveBeenCalledWith('evt-1');
      expect(mockState.loadVentas).toHaveBeenCalledWith('evt-1');
      expect(mockState.loadMovimientos).toHaveBeenCalledWith('evt-1');
    });
  });

  // ─── Computed signals ─────────────────────────────────────────────────────

  describe('Computed signals', () => {
    it('should derive evento from state.selected', () => {
      const ev = makeEvento();
      mockState.selected.set(ev);
      expect(component.evento()).toBe(ev);
    });

    it('should derive eventKpis from state.kpis for this eventoId', () => {
      const kpis = makeKpis();
      mockState.kpis.set({ 'evt-1': kpis });
      expect(component.eventoKpis()).toBe(kpis);
    });

    it('should return null kpis when id not in state', () => {
      mockState.kpis.set({});
      expect(component.eventoKpis()).toBeNull();
    });

    it('should derive eventProductos from state.productos', () => {
      const prods: Producto[] = [
        {
          id: 'p-1',
          eventoId: 'evt-1',
          nombre: 'Empanada',
          precioVenta: 200,
          precioCosto: 100,
          createdAt: '',
          updatedAt: '',
        },
      ];
      mockState.productos.set({ 'evt-1': prods });
      expect(component.eventoProductos()).toEqual(prods);
    });

    it('should return empty array when no productos', () => {
      mockState.productos.set({});
      expect(component.eventoProductos()).toEqual([]);
    });
  });

  // ─── Tabs ─────────────────────────────────────────────────────────────────

  describe('Tabs', () => {
    it('should default to first tab', () => {
      expect(component.activeTab()).toBeTruthy();
    });

    it('should change active tab on onTabChange', () => {
      component.onTabChange('movimientos');
      expect(component.activeTab()).toBe('movimientos');
    });

    it('should expose tabs array', () => {
      expect(component.tabs.length).toBeGreaterThan(0);
    });

    it('should expose ventas tab for VENTA evento type', () => {
      mockState.selected.set(makeEvento({ tipo: TipoEvento.VENTA }));
      const keys = component.tabs.map((t) => t.key);
      expect(keys).toContain('ventas');
      expect(keys).toContain('productos');
    });
  });

  // ─── KPI configs ─────────────────────────────────────────────────────────

  describe('KPI configs', () => {
    it('should expose 5 kpiConfigs', () => {
      expect(component.kpiConfigs.length).toBe(5);
    });

    it('should include totalRecaudado config', () => {
      const keys = component.kpiConfigs.map((k) => k.key);
      expect(keys).toContain('totalRecaudado');
    });

    it('should include gananciaVentas config', () => {
      const keys = component.kpiConfigs.map((k) => k.key);
      expect(keys).toContain('gananciaVentas');
    });

    it('should include balance config', () => {
      const keys = component.kpiConfigs.map((k) => k.key);
      expect(keys).toContain('balance');
    });
  });

  // ─── Navigation ───────────────────────────────────────────────────────────

  describe('Navigation', () => {
    it('should navigate to /eventos on onBack', () => {
      component.onBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos']);
    });

    it('should navigate to edit page on onEdit', () => {
      component.onEdit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos', 'evt-1', 'editar']);
    });
  });
});
