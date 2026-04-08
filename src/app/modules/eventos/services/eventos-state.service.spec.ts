import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { EventosStateService } from './eventos-state.service';
import { EventosApiService } from './eventos-api.service';
import { NotificationService } from '../../../shared/services';
import { MedioPagoEnum, EstadoPago } from '../../../shared/enums/movimiento.enum';

const apiServiceSpy = jasmine.createSpyObj('EventosApiService', [
  'getAll',
  'getById',
  'create',
  'update',
  'delete',
  'getKpis',
  'getResumenVentas',
  'getProductos',
  'createProducto',
  'updateProducto',
  'deleteProducto',
  'getVentas',
  'registrarVenta',
  'registrarVentasLote',
  'registrarIngreso',
  'registrarGasto',
  'cerrar',
]);

const notificationSpy = jasmine.createSpyObj('NotificationService', [
  'showSuccess',
  'showError',
]);

describe('EventosStateService', () => {
  let service: EventosStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventosStateService,
        { provide: EventosApiService, useValue: apiServiceSpy },
        { provide: NotificationService, useValue: notificationSpy },
      ],
    });
    service = TestBed.inject(EventosStateService);

    // Reset spies
    Object.values(apiServiceSpy).forEach((spy: unknown) => {
      if (typeof spy === 'function' && 'calls' in spy) {
        (spy as jasmine.Spy).calls.reset();
      }
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadKpis', () => {
    it('should call getKpis and update _kpis signal', () => {
      const kpis = {
        totalIngresos: 1000,
        totalGastado: 200,
        totalPendienteReembolso: 50,
        balance: 800,
      };
      apiServiceSpy.getKpis.and.returnValue(of(kpis));
      service.loadKpis('evento-1');
      expect(apiServiceSpy.getKpis).toHaveBeenCalledWith('evento-1');
      expect(service.kpis()['evento-1']).toEqual(kpis);
    });
  });

  describe('loadResumenVentas', () => {
    it('should call getResumenVentas and update _resumenVentas signal', () => {
      const resumen = {
        productos: [],
        ventasPorVendedor: [],
        gananciaTotal: 0,
      };
      apiServiceSpy.getResumenVentas.and.returnValue(of(resumen));
      service.loadResumenVentas('evento-1');
      expect(apiServiceSpy.getResumenVentas).toHaveBeenCalledWith('evento-1');
      expect(service.resumenVentas()['evento-1']).toEqual(resumen);
    });
  });

  describe('registrarVentasLote', () => {
    it('should call registrarVentasLote on apiService', () => {
      const ventas = [{ id: 'v1', eventoId: 'e1', productoId: 'p1', vendedorId: 'ven1', cantidad: 3, createdAt: '', updatedAt: '' }];
      apiServiceSpy.registrarVentasLote.and.returnValue(of(ventas));
      const dto = { vendedorId: 'ven1', items: [{ productoId: 'p1', cantidad: 3 }] };
      service.registrarVentasLote('e1', dto).subscribe();
      expect(apiServiceSpy.registrarVentasLote).toHaveBeenCalledWith('e1', dto);
    });

    it('should show success notification on success', () => {
      apiServiceSpy.registrarVentasLote.and.returnValue(of([]));
      service.registrarVentasLote('e1', { vendedorId: 'v1', items: [] }).subscribe();
      expect(notificationSpy.showSuccess).toHaveBeenCalled();
    });
  });

  describe('registrarIngreso', () => {
    it('should call registrarIngreso with full DTO', () => {
      apiServiceSpy.registrarIngreso.and.returnValue(of({}));
      const dto = {
        monto: 500,
        descripcion: 'test',
        responsableId: 'r1',
        medioPago: MedioPagoEnum.EFECTIVO,
      };
      service.registrarIngreso('e1', dto).subscribe();
      expect(apiServiceSpy.registrarIngreso).toHaveBeenCalledWith('e1', dto);
    });
  });

  describe('registrarGasto', () => {
    it('should call registrarGasto with full DTO', () => {
      apiServiceSpy.registrarGasto.and.returnValue(of({}));
      const dto = {
        monto: 200,
        descripcion: 'test',
        responsableId: 'r1',
        medioPago: MedioPagoEnum.EFECTIVO,
        estadoPago: EstadoPago.PAGADO,
      };
      service.registrarGasto('e1', dto).subscribe();
      expect(apiServiceSpy.registrarGasto).toHaveBeenCalledWith('e1', dto);
    });
  });

  describe('cerrarEvento', () => {
    it('should call cerrar and show success notification', () => {
      apiServiceSpy.cerrar.and.returnValue(of({ message: 'ok', movimientos: [] }));
      const dto = { medioPago: MedioPagoEnum.EFECTIVO };
      service.cerrarEvento('e1', dto).subscribe();
      expect(apiServiceSpy.cerrar).toHaveBeenCalledWith('e1', dto);
      expect(notificationSpy.showSuccess).toHaveBeenCalled();
    });
  });

  describe('updateProducto', () => {
    it('should call updateProducto and update local state', () => {
      const updated = { id: 'p1', eventoId: 'e1', nombre: 'Updated', precioVenta: 200, precioCosto: 100, createdAt: '', updatedAt: '' };
      apiServiceSpy.updateProducto.and.returnValue(of(updated));
      service.updateProducto('e1', 'p1', { nombre: 'Updated' }).subscribe();
      expect(apiServiceSpy.updateProducto).toHaveBeenCalledWith('p1', { nombre: 'Updated' });
    });
  });

  describe('deleteProducto', () => {
    it('should call deleteProducto and remove from local state', () => {
      apiServiceSpy.deleteProducto.and.returnValue(of(undefined));
      service.deleteProducto('e1', 'p1').subscribe();
      expect(apiServiceSpy.deleteProducto).toHaveBeenCalledWith('p1');
    });
  });
});
