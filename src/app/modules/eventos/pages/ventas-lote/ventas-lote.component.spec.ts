/**
 * VentasLoteComponent Tests
 * Jasmine + Karma — TDD Pattern: RED-GREEN-REFACTOR
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { VentasLoteComponent } from './ventas-lote.component';
import { EventosStateService } from '../../services/eventos-state.service';
import { PersonasApiService } from '../../../personas/services/personas-api.service';
import {
  Producto,
  VentaProducto,
  EventoKpis,
  ResumenVentas,
  RegisterVentasLoteDto,
  Evento,
} from '../../../../shared/models';
import { TipoEvento, PersonaType, EstadoPersona } from '../../../../shared/enums';
import { Persona } from '../../../../shared/models';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeProducto(overrides: Partial<Producto> = {}): Producto {
  return {
    id: 'p-1',
    eventoId: 'evt-1',
    nombre: 'Empanada',
    precioVenta: 200,
    precioCosto: 100,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function makePersona(overrides: Partial<Persona> = {}): Persona {
  return {
    id: 'per-1',
    tipo: PersonaType.EDUCADOR,
    nombre: 'Juan Perez',
    estado: EstadoPersona.ACTIVO,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
    ...overrides,
  } as Persona;
}

function createMockState() {
  return {
    selected: signal<Evento | null>(null),
    loading: signal<boolean>(false),
    error: signal<string | null>(null),
    kpis: signal<Record<string, EventoKpis>>({}),
    productos: signal<Record<string, Producto[]>>({}),
    ventas: signal<Record<string, VentaProducto[]>>({}),
    resumenVentas: signal<Record<string, ResumenVentas>>({}),
    loadById: jasmine.createSpy('loadById'),
    loadProductos: jasmine.createSpy('loadProductos'),
    registrarVentasLote: jasmine.createSpy('registrarVentasLote').and.returnValue(of([])),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('VentasLoteComponent', () => {
  let component: VentasLoteComponent;
  let fixture: ComponentFixture<VentasLoteComponent>;
  let mockState: ReturnType<typeof createMockState>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockPersonasApi: jasmine.SpyObj<PersonasApiService>;

  const EVENTO_ID = 'evt-1';

  beforeEach(async () => {
    mockState = createMockState();
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRouter.navigate.and.returnValue(Promise.resolve(true));
    mockPersonasApi = jasmine.createSpyObj('PersonasApiService', ['getAll']);
    mockPersonasApi.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [VentasLoteComponent, NoopAnimationsModule, ReactiveFormsModule],
      providers: [
        { provide: EventosStateService, useValue: mockState },
        { provide: Router, useValue: mockRouter },
        { provide: PersonasApiService, useValue: mockPersonasApi },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => EVENTO_ID } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VentasLoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creation ────────────────────────────────────────────────────────────────

  describe('Component creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should call loadById and loadProductos on init', () => {
      expect(mockState.loadById).toHaveBeenCalledWith(EVENTO_ID);
      expect(mockState.loadProductos).toHaveBeenCalledWith(EVENTO_ID);
    });

    it('should load personas on init', () => {
      expect(mockPersonasApi.getAll).toHaveBeenCalled();
    });
  });

  // ─── Computed signals ─────────────────────────────────────────────────────

  describe('productos signal', () => {
    it('should derive productos from state', () => {
      const prods = [makeProducto()];
      mockState.productos.set({ [EVENTO_ID]: prods });
      expect(component.productos()).toEqual(prods);
    });

    it('should return empty array when no productos', () => {
      mockState.productos.set({});
      expect(component.productos()).toEqual([]);
    });
  });

  // ─── Form & submission ────────────────────────────────────────────────────

  describe('form', () => {
    it('should build quantity controls for each producto', () => {
      const prods = [makeProducto({ id: 'p-1' }), makeProducto({ id: 'p-2', nombre: 'Torta' })];
      mockState.productos.set({ [EVENTO_ID]: prods });
      fixture.detectChanges();
      component.buildCantidadControls(prods);
      expect(component.getCantidad('p-1')).toBe(0);
      expect(component.getCantidad('p-2')).toBe(0);
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid (no vendedor selected)', () => {
      component.form.get('vendedorId')?.setValue('');
      component.onSubmit();
      expect(mockState.registrarVentasLote).not.toHaveBeenCalled();
    });

    it('should not submit if no items have cantidad > 0', () => {
      component.form.get('vendedorId')?.setValue('per-1');
      component.onSubmit();
      expect(mockState.registrarVentasLote).not.toHaveBeenCalled();
    });

    it('should call state.registrarVentasLote with correct dto', () => {
      const prods = [makeProducto({ id: 'p-1' })];
      mockState.productos.set({ [EVENTO_ID]: prods });
      component.buildCantidadControls(prods);
      component.form.get('vendedorId')?.setValue('per-1');
      component.setCantidad('p-1', 3);

      component.onSubmit();

      const expectedDto: RegisterVentasLoteDto = {
        vendedorId: 'per-1',
        items: [{ productoId: 'p-1', cantidad: 3 }],
      };
      expect(mockState.registrarVentasLote).toHaveBeenCalledWith(EVENTO_ID, expectedDto);
    });
  });

  // ─── Navigation ───────────────────────────────────────────────────────────

  describe('onBack', () => {
    it('should navigate back to the evento detail', () => {
      component.onBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos', EVENTO_ID]);
    });
  });
});
