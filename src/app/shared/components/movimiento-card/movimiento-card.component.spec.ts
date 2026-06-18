import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MovimientoCardComponent,
  MovimientoCardVM,
} from './movimiento-card.component';
import { EstadoPago } from '../../enums';

describe('MovimientoCardComponent', () => {
  let fixture: ComponentFixture<MovimientoCardComponent>;
  let component: MovimientoCardComponent;

  const baseVM: MovimientoCardVM = {
    id: 'm1',
    tipo: 'egreso',
    descripcion: 'Compra insumos',
    responsableNombre: 'Juan',
    monto: 1000,
    medioPago: 'efectivo',
    estadoPago: EstadoPago.PAGADO,
    fecha: new Date('2026-06-01'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovimientoCardComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MovimientoCardComponent);
    component = fixture.componentInstance;
  });

  function render(
    vm: Partial<MovimientoCardVM> = {},
    opts: { deletable?: boolean; deleting?: boolean } = {},
  ): void {
    component.movimiento = { ...baseVM, ...vm };
    if (opts.deletable !== undefined) component.deletable = opts.deletable;
    if (opts.deleting !== undefined) component.deleting = opts.deleting;
    fixture.detectChanges();
  }

  function estadoEl(): HTMLElement {
    return fixture.nativeElement.querySelector('.movimiento-card__estado');
  }

  it('muestra el badge "Pagado" y no es interactivo cuando está pagado', () => {
    render({ estadoPago: EstadoPago.PAGADO });
    expect(estadoEl().textContent?.trim()).toBe('Pagado');
    expect(estadoEl().getAttribute('role')).toBeNull();
  });

  it('muestra "Pendiente de Reembolso" y emite pagarReembolso al hacer click', () => {
    render({ estadoPago: EstadoPago.PENDIENTE_REEMBOLSO });
    const emitted: MovimientoCardVM[] = [];
    component.pagarReembolso.subscribe((v) => emitted.push(v));

    expect(estadoEl().textContent?.trim()).toBe('Pendiente de Reembolso');
    expect(estadoEl().getAttribute('role')).toBe('button');

    estadoEl().click();
    expect(emitted.length).toBe(1);
    expect(emitted[0].id).toBe('m1');
  });

  it('no emite pagarReembolso al click cuando está pagado', () => {
    render({ estadoPago: EstadoPago.PAGADO });
    let count = 0;
    component.pagarReembolso.subscribe(() => count++);
    estadoEl().click();
    expect(count).toBe(0);
  });

  it('oculta el botón de borrar cuando deletable es false', () => {
    render({}, { deletable: false });
    expect(
      fixture.nativeElement.querySelector('.movimiento-card__delete'),
    ).toBeNull();
  });

  it('cuando deletable, el botón de borrar emite eliminar con el id', () => {
    render({}, { deletable: true });
    const emitted: string[] = [];
    component.eliminar.subscribe((id) => emitted.push(id));

    const btn: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.movimiento-card__delete',
    );
    expect(btn).not.toBeNull();
    btn.click();
    expect(emitted).toEqual(['m1']);
  });

  it('no emite eliminar mientras deleting es true', () => {
    render({}, { deletable: true, deleting: true });
    let count = 0;
    component.eliminar.subscribe(() => count++);
    component.onEliminar(); // guarda: deleting === true no emite
    expect(count).toBe(0);
  });
});
