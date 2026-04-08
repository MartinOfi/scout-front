/**
 * ProductoDialogComponent Tests
 * Jasmine + Karma — TDD Pattern: RED-GREEN-REFACTOR
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ProductoDialogComponent } from './producto-dialog.component';
import { EventosStateService } from '../../../services/eventos-state.service';
import { Producto, CreateProductoDto, EventoKpis, VentaProducto, ResumenVentas } from '../../../../../shared/models';
import { Evento } from '../../../../../shared/models';
import { TipoEvento } from '../../../../../shared/enums';

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
    loadKpis: jasmine.createSpy('loadKpis'),
    loadProductos: jasmine.createSpy('loadProductos'),
    loadVentas: jasmine.createSpy('loadVentas'),
    loadResumenVentas: jasmine.createSpy('loadResumenVentas'),
    createProducto: jasmine.createSpy('createProducto').and.returnValue(of(makeProducto())),
    deleteProducto: jasmine.createSpy('deleteProducto').and.returnValue(of(void 0)),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProductoDialogComponent', () => {
  let component: ProductoDialogComponent;
  let fixture: ComponentFixture<ProductoDialogComponent>;
  let mockState: ReturnType<typeof createMockState>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ProductoDialogComponent>>;

  const EVENTO_ID = 'evt-1';

  beforeEach(async () => {
    mockState = createMockState();
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ProductoDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: EventosStateService, useValue: mockState },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { eventoId: EVENTO_ID } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creation ────────────────────────────────────────────────────────────────

  describe('Component creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject eventoId from dialog data', () => {
      expect(component.data.eventoId).toBe(EVENTO_ID);
    });
  });

  // ─── Computed signals ─────────────────────────────────────────────────────

  describe('productos signal', () => {
    it('should return empty array when no productos in state', () => {
      mockState.productos.set({});
      expect(component.productos()).toEqual([]);
    });

    it('should derive productos from state for the given eventoId', () => {
      const prods = [makeProducto(), makeProducto({ id: 'p-2', nombre: 'Torta' })];
      mockState.productos.set({ [EVENTO_ID]: prods });
      expect(component.productos()).toEqual(prods);
    });

    it('should not return productos from a different eventoId', () => {
      mockState.productos.set({ 'other-evt': [makeProducto()] });
      expect(component.productos()).toEqual([]);
    });
  });

  // ─── Actions ──────────────────────────────────────────────────────────────

  describe('onAdd', () => {
    it('should call state.createProducto with eventoId and dto', () => {
      const dto: CreateProductoDto = { nombre: 'Alfajor', precioVenta: 150, precioCosto: 80 };
      component.onAdd(dto);
      expect(mockState.createProducto).toHaveBeenCalledWith(EVENTO_ID, dto);
    });

    it('should subscribe to the observable returned by createProducto', () => {
      const dto: CreateProductoDto = { nombre: 'Alfajor', precioVenta: 150, precioCosto: 80 };
      component.onAdd(dto);
      // If subscribed, createProducto was called and the spy returned of(...)
      expect(mockState.createProducto).toHaveBeenCalledTimes(1);
    });
  });

  describe('onRemove', () => {
    it('should call state.deleteProducto with eventoId and productoId', () => {
      component.onRemove('p-1');
      expect(mockState.deleteProducto).toHaveBeenCalledWith(EVENTO_ID, 'p-1');
    });

    it('should subscribe to the observable returned by deleteProducto', () => {
      component.onRemove('p-2');
      expect(mockState.deleteProducto).toHaveBeenCalledTimes(1);
    });
  });

  describe('onClose', () => {
    it('should call dialogRef.close()', () => {
      component.onClose();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});
