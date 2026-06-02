/**
 * EventoCardComponent - Unit Tests (TDD)
 */

import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { EventoCardComponent } from './evento-card.component';
import { Evento } from '../../../../../../shared/models';
import { TipoEvento } from '../../../../../../shared/enums';

const makeEvento = (overrides: Partial<Evento> = {}): Evento => ({
  id: 'ev1',
  nombre: 'Kermesse 2026',
  fecha: '2026-06-15',
  descripcion: 'Descripción del evento',
  tipo: TipoEvento.GRUPO,
  destinoGanancia: null,
  tipoEvento: 'Kermesse',
  reportePublico: false,
  productos: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('EventoCardComponent', () => {
  let component: EventoCardComponent;
  let fixture: ComponentFixture<EventoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventoCardComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(EventoCardComponent);
    component = fixture.componentInstance;
    component.evento = makeEvento();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onSelect', () => {
    it('should emit select with evento id', () => {
      const spy = spyOn(component.select, 'emit');
      component.onSelect();
      expect(spy).toHaveBeenCalledWith('ev1');
    });
  });

  describe('onEdit', () => {
    it('should emit edit with evento id', () => {
      const spy = spyOn(component.edit, 'emit');
      component.onEdit();
      expect(spy).toHaveBeenCalledWith('ev1');
    });
  });

  describe('tipoLabel', () => {
    it('should return "Evento de Venta" for TipoEvento.VENTA', () => {
      component.evento = makeEvento({ tipo: TipoEvento.VENTA });
      expect(component.tipoLabel).toBe('Evento de Venta');
    });

    it('should return "Evento de Grupo" for TipoEvento.GRUPO', () => {
      component.evento = makeEvento({ tipo: TipoEvento.GRUPO });
      expect(component.tipoLabel).toBe('Evento de Grupo');
    });
  });

  describe('isVenta', () => {
    it('should return true for VENTA events', () => {
      component.evento = makeEvento({ tipo: TipoEvento.VENTA });
      expect(component.isVenta).toBeTrue();
    });

    it('should return false for GRUPO events', () => {
      component.evento = makeEvento({ tipo: TipoEvento.GRUPO });
      expect(component.isVenta).toBeFalse();
    });
  });

  describe('productosCount', () => {
    it('should return the number of products', () => {
      component.evento = makeEvento({
        tipo: TipoEvento.VENTA,
        productos: [
          {
            id: 'p1',
            eventoId: 'ev1',
            nombre: 'Empanada',
            precioVenta: 100,
            precioCosto: 50,
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 'p2',
            eventoId: 'ev1',
            nombre: 'Jugo',
            precioVenta: 50,
            precioCosto: 20,
            createdAt: '',
            updatedAt: '',
          },
        ],
      });
      expect(component.productosCount).toBe(2);
    });

    it('should return 0 when no products', () => {
      component.evento = makeEvento({ productos: [] });
      expect(component.productosCount).toBe(0);
    });
  });

  describe('stopPropagation on action buttons', () => {
    it('should stop propagation and emit edit when edit button clicked', () => {
      const spy = spyOn(component.edit, 'emit');
      const editBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
        '[data-testid="edit-btn"]',
      );
      expect(editBtn).toBeTruthy();
      editBtn.click();
      expect(spy).toHaveBeenCalledWith('ev1');
    });
  });
});
