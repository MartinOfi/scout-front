import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Evento,
  EventoKpis,
  Producto,
  VentaProducto,
  ResumenVentas,
  CreateEventoDto,
  UpdateEventoDto,
  CreateProductoDto,
  UpdateProductoDto,
  CreateVentaProductoDto,
  RegisterVentasLoteDto,
  CerrarEventoVentaDto,
  RegistrarIngresoEventoDto,
  RegistrarGastoEventoDto,
} from '../../../shared/models';
import { Movimiento } from '../../../shared/models';
import { HttpService } from '../../../shared/services';
import { API_CONFIG } from '../../../shared/constants';

/**
 * API service for Eventos module
 * All methods typed — no any
 */
@Injectable({
  providedIn: 'root',
})
export class EventosApiService {
  private readonly http = inject(HttpService);
  private readonly endpoint = API_CONFIG.ENDPOINTS.EVENTOS;

  // ============================================================================
  // EVENTOS
  // ============================================================================

  getAll(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.endpoint);
  }

  getById(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.endpoint}/${id}`);
  }

  create(dto: CreateEventoDto): Observable<Evento> {
    return this.http.post<Evento, CreateEventoDto>(this.endpoint, dto);
  }

  update(id: string, dto: UpdateEventoDto): Observable<Evento> {
    return this.http.patch<Evento, UpdateEventoDto>(`${this.endpoint}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  // ============================================================================
  // KPIs & RESUMEN
  // ============================================================================

  getKpis(eventoId: string): Observable<EventoKpis> {
    return this.http.get<EventoKpis>(`${this.endpoint}/${eventoId}/kpis`);
  }

  getResumenVentas(eventoId: string, vendedor?: string): Observable<ResumenVentas> {
    const params: Record<string, string> = {};
    if (vendedor) params['vendedor'] = vendedor;
    return this.http.get<ResumenVentas>(`${this.endpoint}/${eventoId}/resumen-ventas`, params);
  }

  // ============================================================================
  // PRODUCTOS
  // Note: deleteProducto and updateProducto use /eventos/productos/:productoId
  // (no eventoId in URL — backend owns the ID)
  // ============================================================================

  getProductos(eventoId: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.endpoint}/${eventoId}/productos`);
  }

  createProducto(eventoId: string, dto: CreateProductoDto): Observable<Producto> {
    return this.http.post<Producto, CreateProductoDto>(
      `${this.endpoint}/${eventoId}/productos`,
      dto,
    );
  }

  updateProducto(productoId: string, dto: UpdateProductoDto): Observable<Producto> {
    return this.http.patch<Producto, UpdateProductoDto>(
      `${this.endpoint}/productos/${productoId}`,
      dto,
    );
  }

  deleteProducto(productoId: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/productos/${productoId}`);
  }

  // ============================================================================
  // VENTAS
  // ============================================================================

  getVentas(eventoId: string): Observable<VentaProducto[]> {
    return this.http.get<VentaProducto[]>(`${this.endpoint}/${eventoId}/ventas`);
  }

  registrarVenta(eventoId: string, dto: CreateVentaProductoDto): Observable<VentaProducto> {
    return this.http.post<VentaProducto, CreateVentaProductoDto>(
      `${this.endpoint}/${eventoId}/ventas`,
      dto,
    );
  }

  registrarVentasLote(eventoId: string, dto: RegisterVentasLoteDto): Observable<VentaProducto[]> {
    return this.http.post<VentaProducto[], RegisterVentasLoteDto>(
      `${this.endpoint}/${eventoId}/ventas/lote`,
      dto,
    );
  }

  deleteVenta(eventoId: string, ventaId: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${eventoId}/ventas/${ventaId}`);
  }

  // ============================================================================
  // MOVIMIENTOS
  // ============================================================================

  getMovimientos(
    eventoId: string,
    filters?: { tipo?: string; concepto?: string },
  ): Observable<Movimiento[]> {
    const params: Record<string, string> = {};
    if (filters?.tipo) params['tipo'] = filters.tipo;
    if (filters?.concepto) params['concepto'] = filters.concepto;
    return this.http.get<Movimiento[]>(`${this.endpoint}/${eventoId}/movimientos`, params);
  }

  // ============================================================================
  // INGRESOS Y GASTOS
  // ============================================================================

  registrarIngreso(eventoId: string, dto: RegistrarIngresoEventoDto): Observable<Movimiento> {
    return this.http.post<Movimiento, RegistrarIngresoEventoDto>(
      `${this.endpoint}/${eventoId}/ingresos`,
      dto,
    );
  }

  registrarGasto(eventoId: string, dto: RegistrarGastoEventoDto): Observable<Movimiento> {
    return this.http.post<Movimiento, RegistrarGastoEventoDto>(
      `${this.endpoint}/${eventoId}/gastos`,
      dto,
    );
  }

  // ============================================================================
  // CIERRE DE EVENTO
  // ============================================================================

  cerrar(
    eventoId: string,
    dto: CerrarEventoVentaDto,
  ): Observable<{ message: string; movimientos: Movimiento[] }> {
    return this.http.post<{ message: string; movimientos: Movimiento[] }, CerrarEventoVentaDto>(
      `${this.endpoint}/${eventoId}/cerrar`,
      dto,
    );
  }
}
