import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntregasTabComponent } from './entregas-tab.component';
import {
  EntregaResponse,
  StockEntregaResponse,
} from '../../../../../../shared/models';

describe('EntregasTabComponent', () => {
  let component: EntregasTabComponent;
  let fixture: ComponentFixture<EntregasTabComponent>;

  const stock: StockEntregaResponse[] = [
    {
      productoId: 'p1',
      productoNombre: 'Locro',
      vendedorId: 'v1',
      vendedorNombre: 'Juan Pérez',
      cantidadVendida: 10,
      cantidadEntregada: 3,
      cantidadDisponible: 7,
    },
    {
      productoId: 'p2',
      productoNombre: 'Empanada',
      vendedorId: 'v1',
      vendedorNombre: 'Juan Pérez',
      cantidadVendida: 5,
      cantidadEntregada: 5,
      cantidadDisponible: 0,
    },
    {
      productoId: 'p1',
      productoNombre: 'Locro',
      vendedorId: 'v2',
      vendedorNombre: 'Ana García',
      cantidadVendida: 4,
      cantidadEntregada: 0,
      cantidadDisponible: 4,
    },
  ];

  const entregas: EntregaResponse[] = [
    {
      id: 'e1',
      eventoId: 'ev-1',
      vendedorId: 'v1',
      vendedorNombre: 'Juan Pérez',
      fecha: null,
      notas: 'Retiró María',
      createdAt: '2026-05-22T18:00:00Z',
      lineas: [
        { id: 'l1', productoId: 'p1', productoNombre: 'Locro', cantidad: 3 },
      ],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntregasTabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EntregasTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should produce one row per vendedor sorted alphabetically', () => {
    component.stock = stock;
    component.entregas = entregas;
    fixture.detectChanges();

    const rows = component.rows();
    expect(rows.length).toBe(2);
    expect(rows[0].vendedorNombre).toBe('Ana García');
    expect(rows[1].vendedorNombre).toBe('Juan Pérez');
  });

  it('should sort productos within a row alphabetically', () => {
    component.stock = stock;
    fixture.detectChanges();

    const juan = component.rows().find((r) => r.vendedorId === 'v1');
    expect(juan?.productos.map((p) => p.productoNombre)).toEqual([
      'Empanada',
      'Locro',
    ]);
  });

  it('should attach entregas of each vendedor newest first', () => {
    component.stock = stock;
    component.entregas = entregas;
    fixture.detectChanges();

    const juan = component.rows().find((r) => r.vendedorId === 'v1');
    expect(juan?.entregas.length).toBe(1);
    expect(juan?.entregas[0].id).toBe('e1');
  });

  it('should toggle expansion state per vendedorId', () => {
    expect(component.isExpanded('v1')).toBe(false);
    component.toggleExpanded('v1');
    expect(component.isExpanded('v1')).toBe(true);
    component.toggleExpanded('v1');
    expect(component.isExpanded('v1')).toBe(false);
  });

  it('should emit registrarEntrega with the vendedorId on button click', () => {
    spyOn(component.registrarEntrega, 'emit');
    const stop = jasmine.createSpyObj<Event>('Event', ['stopPropagation']);
    component.onRegistrar('v1', stop);
    expect(stop.stopPropagation).toHaveBeenCalled();
    expect(component.registrarEntrega.emit).toHaveBeenCalledWith('v1');
  });

  it('should emit deleteEntrega with the entregaId on delete click', () => {
    spyOn(component.deleteEntrega, 'emit');
    const stop = jasmine.createSpyObj<Event>('Event', ['stopPropagation']);
    component.onDelete('e1', stop);
    expect(stop.stopPropagation).toHaveBeenCalled();
    expect(component.deleteEntrega.emit).toHaveBeenCalledWith('e1');
  });

  it('isDeleting should read from the input set', () => {
    component.deletingIds = new Set(['e1']);
    fixture.detectChanges();
    expect(component.isDeleting('e1')).toBe(true);
    expect(component.isDeleting('e2')).toBe(false);
  });

  it('should render empty state when there is no stock', () => {
    component.stock = [];
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.entregas-empty')).toBeTruthy();
    expect(host.querySelector('.entregas-list')).toBeNull();
  });
});
