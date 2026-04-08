/**
 * TDD tests for evento.model.ts
 * Verifies all interfaces and DTOs match the backend contract.
 */
import {
  EventoKpis,
  ResumenVentas,
  ResumenProducto,
  ResumenVendedor,
  RegisterVentasLoteDto,
  VentaItemDto,
  CerrarEventoVentaDto,
  RegistrarIngresoEventoDto,
  RegistrarGastoEventoDto,
  VentaProducto,
} from './evento.model';
import { TipoEvento, DestinoGanancia } from '../enums';
import { MedioPagoEnum, EstadoPago } from '../enums/movimiento.enum';

describe('EventoKpis interface', () => {
  it('should compile with all required fields', () => {
    const kpis: EventoKpis = {
      totalIngresos: 1000,
      totalGastado: 200,
      totalPendienteReembolso: 50,
      balance: 800,
    };
    expect(kpis.totalIngresos).toBe(1000);
    expect(kpis.totalGastado).toBe(200);
    expect(kpis.totalPendienteReembolso).toBe(50);
    expect(kpis.balance).toBe(800);
  });
});

describe('ResumenProducto interface', () => {
  it('should compile with all required fields', () => {
    const resumen: ResumenProducto = {
      nombre: 'Empanada',
      precioCosto: 100,
      precioVenta: 200,
      cantidadVendida: 10,
      ganancia: 1000,
    };
    expect(resumen.nombre).toBe('Empanada');
    expect(resumen.ganancia).toBe(1000);
  });
});

describe('ResumenVendedor interface', () => {
  it('should compile with all required fields', () => {
    const vendedor: ResumenVendedor = {
      vendedorId: 'uuid-123',
      vendedorNombre: 'Juan',
      cantidadTotal: 5,
      gananciaTotal: 500,
    };
    expect(vendedor.vendedorId).toBe('uuid-123');
  });
});

describe('ResumenVentas interface', () => {
  it('should compile with all required fields', () => {
    const resumen: ResumenVentas = {
      productos: [],
      ventasPorVendedor: [],
      gananciaTotal: 0,
    };
    expect(resumen.productos).toEqual([]);
    expect(resumen.gananciaTotal).toBe(0);
  });
});

describe('RegisterVentasLoteDto', () => {
  it('should compile with vendedorId, medioPago and items', () => {
    const dto: RegisterVentasLoteDto = {
      vendedorId: 'uuid-vendedor',
      medioPago: MedioPagoEnum.EFECTIVO,
      items: [{ productoId: 'uuid-producto', cantidad: 3 }],
    };
    expect(dto.vendedorId).toBe('uuid-vendedor');
    expect(dto.medioPago).toBe(MedioPagoEnum.EFECTIVO);
    expect(dto.items.length).toBe(1);
  });
});

describe('VentaItemDto', () => {
  it('should compile with productoId and cantidad', () => {
    const item: VentaItemDto = {
      productoId: 'uuid-producto',
      cantidad: 5,
    };
    expect(item.cantidad).toBe(5);
  });
});

describe('CerrarEventoVentaDto', () => {
  it('should compile with medioPago', () => {
    const dto: CerrarEventoVentaDto = {
      medioPago: MedioPagoEnum.EFECTIVO,
    };
    expect(dto.medioPago).toBe('efectivo');
  });
});

describe('RegistrarIngresoEventoDto', () => {
  it('should compile with all required fields', () => {
    const dto: RegistrarIngresoEventoDto = {
      monto: 500,
      descripcion: 'Entrada general',
      responsableId: 'uuid-responsable',
      medioPago: MedioPagoEnum.TRANSFERENCIA,
    };
    expect(dto.monto).toBe(500);
    expect(dto.medioPago).toBe('transferencia');
  });
});

describe('RegistrarGastoEventoDto', () => {
  it('should compile with all required fields', () => {
    const dto: RegistrarGastoEventoDto = {
      monto: 200,
      descripcion: 'Ingredientes',
      responsableId: 'uuid-responsable',
      medioPago: MedioPagoEnum.EFECTIVO,
      estadoPago: EstadoPago.PAGADO,
    };
    expect(dto.estadoPago).toBe('pagado');
  });

  it('should accept optional personaAReembolsarId when pending', () => {
    const dto: RegistrarGastoEventoDto = {
      monto: 200,
      descripcion: 'Ingredientes',
      responsableId: 'uuid-responsable',
      medioPago: MedioPagoEnum.EFECTIVO,
      estadoPago: EstadoPago.PENDIENTE_REEMBOLSO,
      personaAReembolsarId: 'uuid-persona',
    };
    expect(dto.personaAReembolsarId).toBe('uuid-persona');
  });
});

describe('VentaProducto', () => {
  it('should use vendedorId instead of personaId', () => {
    const venta: VentaProducto = {
      id: 'uuid-venta',
      eventoId: 'uuid-evento',
      productoId: 'uuid-producto',
      vendedorId: 'uuid-vendedor',
      cantidad: 2,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    expect(venta.vendedorId).toBeDefined();
    expect((venta as any).personaId).toBeUndefined();
  });
});
