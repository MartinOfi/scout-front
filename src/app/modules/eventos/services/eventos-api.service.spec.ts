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
      providers: [EventosApiService, provideHttpClient(), provideHttpClientTesting()],
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
      const req = httpMock.expectOne(
        (r) => r.url.includes(`/eventos/productos/${productoId}`) && r.method === 'DELETE',
      );
      expect(req.request.url).not.toContain('/eventos/evento-abc/productos/');
      req.flush({});
    });
  });

  describe('getKpis', () => {
    it('should call GET /eventos/:id/kpis', () => {
      const eventoId = 'evento-123';
      service.getKpis(eventoId).subscribe();
      const req = httpMock.expectOne(
        (r) => r.url.includes(`/eventos/${eventoId}/kpis`) && r.method === 'GET',
      );
      req.flush({
        totalRecaudado: 0,
        gananciaVentas: 0,
        totalGastado: 0,
        totalPendienteReembolso: 0,
        balance: 0,
      });
    });
  });

  describe('registrarVentasLote', () => {
    it('should call POST /eventos/:id/ventas/lote', () => {
      const eventoId = 'evento-123';
      const dto = {
        vendedorId: 'vendedor-abc',
        medioPago: MedioPagoEnum.EFECTIVO,
        items: [{ productoId: 'prod-1', cantidad: 3 }],
      };
      service.registrarVentasLote(eventoId, dto).subscribe();
      const req = httpMock.expectOne(
        (r) => r.url.includes(`/eventos/${eventoId}/ventas/lote`) && r.method === 'POST',
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
      const req = httpMock.expectOne(
        (r) => r.url.includes(`/eventos/${eventoId}/ingresos`) && r.method === 'POST',
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
      const req = httpMock.expectOne(
        (r) => r.url.includes(`/eventos/${eventoId}/gastos`) && r.method === 'POST',
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
      const req = httpMock.expectOne(
        (r) => r.url.includes(`/eventos/productos/${productoId}`) && r.method === 'PATCH',
      );
      expect(req.request.body).toEqual(dto);
      req.flush({});
    });
  });

  describe('getEntregas', () => {
    it('should call GET /eventos/:id/entregas without vendedor param', () => {
      service.getEntregas('evento-123').subscribe();
      const req = httpMock.expectOne(
        (r) => r.url.includes('/eventos/evento-123/entregas') && r.method === 'GET',
      );
      expect(req.request.params.get('vendedor')).toBeNull();
      req.flush([]);
    });

    it('should pass vendedor as query param when provided', () => {
      service.getEntregas('evento-123', 'Juan').subscribe();
      const req = httpMock.expectOne(
        (r) => r.url.includes('/eventos/evento-123/entregas') && r.method === 'GET',
      );
      expect(req.request.params.get('vendedor')).toBe('Juan');
      req.flush([]);
    });
  });

  describe('getStockEntregas', () => {
    it('should call GET /eventos/:id/entregas/stock-disponible', () => {
      service.getStockEntregas('evento-123').subscribe();
      const req = httpMock.expectOne(
        (r) =>
          r.url.includes('/eventos/evento-123/entregas/stock-disponible') && r.method === 'GET',
      );
      req.flush([]);
    });
  });

  describe('crearEntrega', () => {
    it('should call POST /eventos/:id/entregas with the dto body', () => {
      const dto = {
        vendedorId: 'vendedor-abc',
        notas: 'Retiró María 18:30',
        items: [{ productoId: 'prod-1', cantidad: 4 }],
      };
      service.crearEntrega('evento-123', dto).subscribe();
      const req = httpMock.expectOne(
        (r) => r.url.includes('/eventos/evento-123/entregas') && r.method === 'POST',
      );
      expect(req.request.body).toEqual(dto);
      req.flush({
        id: 'entrega-1',
        eventoId: 'evento-123',
        vendedorId: 'vendedor-abc',
        vendedorNombre: 'Juan',
        fecha: null,
        notas: 'Retiró María 18:30',
        createdAt: '2026-05-22T18:30:00Z',
        lineas: [],
      });
    });
  });

  describe('deleteEntrega', () => {
    it('should call DELETE /eventos/:eventoId/entregas/:entregaId', () => {
      service.deleteEntrega('evento-123', 'entrega-456').subscribe();
      const req = httpMock.expectOne(
        (r) => r.url.includes('/eventos/evento-123/entregas/entrega-456') && r.method === 'DELETE',
      );
      req.flush({});
    });
  });

  describe('cerrarEvento', () => {
    it('should call POST /eventos/:id/cerrar and return the updated Evento', () => {
      const eventoId = 'evento-123';
      const mockEvento = {
        id: eventoId,
        estaCerrado: true,
        nombre: 'Venta de Empanadas',
        tipo: 'venta',
        fecha: '2026-05-25',
        descripcion: null,
        destinoGanancia: 'cuentas_personales',
        tipoEvento: null,
        productos: [],
        createdAt: '2026-05-01T00:00:00Z',
        updatedAt: '2026-05-25T00:00:00Z',
      };

      service.cerrarEvento(eventoId).subscribe((res) => {
        expect(res.estaCerrado).toBe(true);
        expect(res.id).toBe(eventoId);
      });

      const req = httpMock.expectOne(
        (r) => r.url.includes(`/eventos/${eventoId}/cerrar`) && r.method === 'POST',
      );
      expect(req.request.body).toEqual({});
      req.flush(mockEvento);
    });
  });

  describe('habilitarMovimientos', () => {
    it('should call POST /eventos/:id/habilitar-movimientos and return the updated Evento', () => {
      const eventoId = 'evento-123';
      const mockEvento = {
        id: eventoId,
        estaCerrado: false,
        movimientosHabilitados: true,
        nombre: 'Venta de Empanadas',
        tipo: 'venta',
        fecha: '2026-05-25',
        descripcion: null,
        destinoGanancia: 'cuentas_personales',
        tipoEvento: null,
        reportePublico: false,
        productos: [],
        createdAt: '2026-05-01T00:00:00Z',
        updatedAt: '2026-05-25T00:00:00Z',
      };

      service.habilitarMovimientos(eventoId).subscribe((res) => {
        expect(res.movimientosHabilitados).toBe(true);
        expect(res.id).toBe(eventoId);
      });

      const req = httpMock.expectOne(
        (r) => r.url.includes(`/eventos/${eventoId}/habilitar-movimientos`) && r.method === 'POST',
      );
      expect(req.request.body).toEqual({});
      req.flush(mockEvento);
    });
  });
});
