import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Evento,
  EventoConResumen,
  Producto,
  VentaProducto,
  CreateEventoDto,
  UpdateEventoDto,
  CreateProductoDto,
  CreateVentaProductoDto,
  Movimiento,
} from '../../../shared/models';
import { HttpService } from '../../../shared/services';
import { API_CONFIG } from '../../../shared/constants';

/**
 * API service for Eventos module
 * SIN any - all methods are typed
 * PRD F10, F11: Eventos de Venta y Eventos de Grupo
 */
@Injectable({
  providedIn: 'root',
})
export class EventosApiService {
  private readonly http = inject(HttpService);
  private readonly endpoint = API_CONFIG.ENDPOINTS.EVENTOS;

  /**
   * Get all eventos
   */
  getAll(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.endpoint);
  }

  /**
   * Get evento by ID
   */
  getById(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new evento
   */
  create(dto: CreateEventoDto): Observable<Evento> {
    return this.http.post<Evento, CreateEventoDto>(this.endpoint, dto);
  }

  /**
   * Update an evento (PATCH)
   */
  update(id: string, dto: UpdateEventoDto): Observable<Evento> {
    return this.http.patch<Evento, UpdateEventoDto>(
      `${this.endpoint}/${id}`,
      dto
    );
  }

  /**
   * Get financial summary of evento
   */
  getResumen(
    id: string
  ): Observable<{
    totalIngresos: number;
    totalEgresos: number;
    resultadoNeto: number;
  }> {
    return this.http.get(`${this.endpoint}/${id}/resumen`);
  }

  /**
   * Delete an evento (soft delete)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  // ============================================================================
  // PRODUCTOS (Sale events only)
  // ============================================================================

  /**
   * Get all productos of an evento
   */
  getProductos(eventoId: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.endpoint}/${eventoId}/productos`);
  }

  /**
   * Create a new producto for an evento
   */
  createProducto(
    eventoId: string,
    dto: CreateProductoDto
  ): Observable<Producto> {
    return this.http.post<Producto, CreateProductoDto>(
      `${this.endpoint}/${eventoId}/productos`,
      dto
    );
  }

  /**
   * Delete a producto
   */
  deleteProducto(eventoId: string, productoId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.endpoint}/${eventoId}/productos/${productoId}`
    );
  }

  // ============================================================================
  // VENTAS (Sale records for sale events)
  // ============================================================================

  /**
   * Get all ventas for an evento
   */
  getVentas(eventoId: string): Observable<VentaProducto[]> {
    return this.http.get<VentaProducto[]>(
      `${this.endpoint}/${eventoId}/ventas`
    );
  }

  /**
   * Register a venta de producto
   */
  registrarVenta(
    eventoId: string,
    dto: CreateVentaProductoDto
  ): Observable<VentaProducto> {
    return this.http.post<VentaProducto, CreateVentaProductoDto>(
      `${this.endpoint}/${eventoId}/ventas`,
      dto
    );
  }

  /**
   * Delete a venta
   */
  deleteVenta(eventoId: string, ventaId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.endpoint}/${eventoId}/ventas/${ventaId}`
    );
  }

  // ============================================================================
  // INGRESOS Y EGRESOS
  // ============================================================================

  /**
   * Register an ingreso for evento
   */
  registrarIngreso(
    eventoId: string,
    monto: number,
    descripcion: string
  ): Observable<Movimiento> {
    return this.http.post<Movimiento, { monto: number; descripcion: string }>(
      `${this.endpoint}/${eventoId}/ingresos`,
      {
        monto,
        descripcion,
      }
    );
  }

  /**
   * Register an egreso for evento
   */
  registrarEgreso(
    eventoId: string,
    monto: number,
    descripcion: string,
    responsableId: string,
    medioPago: string,
    estadoPago: string
  ): Observable<Movimiento> {
    return this.http.post<
      Movimiento,
      {
        monto: number;
        descripcion: string;
        responsableId: string;
        medioPago: string;
        estadoPago: string;
      }
    >(`${this.endpoint}/${eventoId}/egresos`, {
      monto,
      descripcion,
      responsableId,
      medioPago,
      estadoPago,
    });
  }

  // ============================================================================
  // CIERRE DE EVENTO
  // ============================================================================

  /**
   * Close an evento and distribute earnings
   * Backend: POST /eventos/:id/cerrar
   */
  cerrar(
    eventoId: string,
    medioPago: string
  ): Observable<{ message: string; movimientos: Movimiento[] }> {
    return this.http.post<
      { message: string; movimientos: Movimiento[] },
      { medioPago: string }
    >(`${this.endpoint}/${eventoId}/cerrar`, { medioPago });
  }

  /**
   * Get resumen de ventas for evento
   * Backend: GET /eventos/:id/resumen-ventas
   */
  getResumenVentas(eventoId: string): Observable<{
    eventoId: string;
    totalVentas: number;
    totalCosto: number;
    gananciaTotal: number;
    ventasPorProducto: Array<{
      productoId: string;
      nombre: string;
      cantidadVendida: number;
      ingresos: number;
      costo: number;
      ganancia: number;
    }>;
    ventasPorVendedor: Array<{
      vendedorId: string;
      nombre: string;
      cantidadVendida: number;
      ganancia: number;
    }>;
  }> {
    return this.http.get(`${this.endpoint}/${eventoId}/resumen-ventas`);
  }
}
