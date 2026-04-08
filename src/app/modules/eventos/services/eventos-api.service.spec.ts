import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EventosApiService } from './eventos-api.service';
import { MedioPagoEnum, EstadoPago } from '../../../shared/enums/movimiento.enum';

describe('EventosApiService', () => {
  let service: EventosApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventosApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(EventosApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('deleteProducto', () => {
    it('should call DELETE /eventos/productos/:productoId (NOT /eventos/:eventoId/productos/:productoId)', () => {
      const productoId = 'prod-123';
      service.deleteProducto(productoId).subscribe();
      const req = httpMock.expectOne((r) =>
        r.url.includes(`/eventos/productos/${productoId}`) && r.method === 'DELETE'
      );
      expect(req.request.url).not.toContain('/eventos/evento-abc/productos/');
      req.flush({});
    });
  });

  describe('getKpis', () => {
    it('should call GET /eventos/:id/kpis', () => {
      const eventoId = 'evento-123';
      service.getKpis(eventoId).subscribe();
      const req = httpMock.expectOne((r) =>
        r.url.includes(`/eventos/${eventoId}/kpis`) && r.method === 'GET'
      );
      req.flush({ totalIngresos: 0, totalGastado: 0, totalPendienteReembolso: 0, balance: 0 });
    });
  });

  describe('registrarVentasLote', () => {
    it('should call POST /eventos/:id/ventas/lote', () => {
      const eventoId = 'evento-123';
      const dto = {
        vendedorId: 'vendedor-abc',
        items: [{ productoId: 'prod-1', cantidad: 3 }],
      };
      service.registrarVentasLote(eventoId, dto).subscribe();
      const req = httpMock.expectOne((r) =>
        r.url.includes(`/eventos/${eventoId}/ventas/lote`) && r.method === 'POST'
      );
      expect(req.request.body).toEqual(dto);
      req.flush([]);
    });
  });

  describe('registrarIngreso', () => {
    it('should call POST /eventos/:id/ingresos with full DTO', () => {
      const eventoId = 'evento-123';
      const dto = {
        monto: 500,
        descripcion: 'Entrada general',
        responsableId: 'uuid-resp',
        medioPago: MedioPagoEnum.EFECTIVO,
      };
      service.registrarIngreso(eventoId, dto).subscribe();
      const req = httpMock.expectOne((r) =>
        r.url.includes(`/eventos/${eventoId}/ingresos`) && r.method === 'POST'
      );
      expect(req.request.body).toEqual(dto);
      req.flush({});
    });
  });

  describe('registrarGasto', () => {
    it('should call POST /eventos/:id/gastos with full DTO', () => {
      const eventoId = 'evento-123';
      const dto = {
        monto: 200,
        descripcion: 'Ingredientes',
        responsableId: 'uuid-resp',
        medioPago: MedioPagoEnum.EFECTIVO,
        estadoPago: EstadoPago.PAGADO,
      };
      service.registrarGasto(eventoId, dto).subscribe();
      const req = httpMock.expectOne((r) =>
        r.url.includes(`/eventos/${eventoId}/gastos`) && r.method === 'POST'
      );
      expect(req.request.body).toEqual(dto);
      req.flush({});
    });
  });

  describe('updateProducto', () => {
    it('should call PATCH /eventos/productos/:productoId', () => {
      const productoId = 'prod-123';
      const dto = { nombre: 'Empanada', precioCosto: 100, precioVenta: 200 };
      service.updateProducto(productoId, dto).subscribe();
      const req = httpMock.expectOne((r) =>
        r.url.includes(`/eventos/productos/${productoId}`) && r.method === 'PATCH'
      );
      expect(req.request.body).toEqual(dto);
      req.flush({});
    });
  });
});
