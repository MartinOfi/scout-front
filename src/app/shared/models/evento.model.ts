/**
 * Evento models
 * Typed interfaces - NO any
 * Mirrors backend: eventos-implementation-guide.md
 */

import { TipoEvento, DestinoGanancia } from '../enums';
import { MedioPagoEnum, EstadoPago } from '../enums/movimiento.enum';

/**
 * Evento (Sale event or group event)
 */
export interface Evento {
  id: string;
  nombre: string;
  fecha: string; // ISO 8601 date (YYYY-MM-DD)
  descripcion: string | null;
  tipo: TipoEvento;
  destinoGanancia: DestinoGanancia | null; // Only for TipoEvento.VENTA
  tipoEvento: string | null; // Only for TipoEvento.GRUPO (e.g. "Kermesse")
  productos: Producto[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Evento with financial summary (legacy - kept for compatibility)
 */
export interface EventoConResumen extends Evento {
  totalIngresos: number;
  totalEgresos: number;
  resultadoNeto: number;
}

/**
 * Producto (Sale event product)
 */
export interface Producto {
  id: string;
  eventoId: string;
  nombre: string;
  precioVenta: number;
  precioCosto: number;
  cantidadVendida?: number; // populated by backend when available
  createdAt: string;
  updatedAt: string;
}

/**
 * Venta de Producto (Sale record)
 * Backend uses vendedorId, not personaId
 */
export interface VentaProducto {
  id: string;
  eventoId: string;
  productoId: string;
  vendedorId: string;
  cantidad: number;
  producto?: Producto;
  vendedor?: {
    id: string;
    nombre: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── KPIs & Resúmenes ────────────────────────────────────────────────────────

/**
 * KPIs financieros del evento
 * Backend: GET /eventos/:id/kpis
 */
export interface EventoKpis {
  totalIngresos: number;
  totalGastado: number; // Only gastos with estadoPago === PAGADO
  totalPendienteReembolso: number; // Gastos with estadoPago === PENDIENTE_REEMBOLSO
  balance: number; // totalIngresos - totalGastado
}

/**
 * Summary per product (for sale events)
 */
export interface ResumenProducto {
  nombre: string;
  precioCosto: number;
  precioVenta: number;
  cantidadVendida: number;
  ganancia: number; // (precioVenta - precioCosto) × cantidadVendida
}

/**
 * Desglose per product inside a ResumenVendedor
 */
export interface DesglosProducto {
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  ganancia: number;
}

/**
 * Summary per vendedor
 */
export interface ResumenVendedor {
  vendedorId: string;
  vendedorNombre: string;
  cantidadTotal: number;
  gananciaTotal: number;
  desglose: DesglosProducto[];
}

/**
 * Full sales summary
 * Backend: GET /eventos/:id/resumen-ventas
 */
export interface ResumenVentas {
  productos: ResumenProducto[];
  ventasPorVendedor: ResumenVendedor[];
  gananciaTotal: number;
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

/**
 * DTO for creating an evento
 */
export interface CreateEventoDto {
  nombre: string;
  fecha: string; // ISO 8601 date (YYYY-MM-DD)
  descripcion?: string;
  tipo: TipoEvento;
  destinoGanancia?: DestinoGanancia; // Required if tipo === VENTA
  tipoEvento?: string; // Max 50 chars. Only for tipo === GRUPO
}

/**
 * DTO for updating an evento
 */
export interface UpdateEventoDto {
  nombre?: string;
  fecha?: string;
  descripcion?: string;
  tipo?: TipoEvento;
  destinoGanancia?: DestinoGanancia;
  tipoEvento?: string;
}

/**
 * DTO for creating a producto
 */
export interface CreateProductoDto {
  nombre: string;
  precioVenta: number;
  precioCosto: number;
}

/**
 * DTO for updating a producto
 * Backend: PATCH /eventos/productos/:productoId
 */
export interface UpdateProductoDto {
  nombre?: string;
  precioVenta?: number;
  precioCosto?: number;
}

/**
 * DTO for a single venta (single sale)
 */
export interface CreateVentaProductoDto {
  productoId: string;
  vendedorId: string;
  cantidad: number;
}

/**
 * Individual item in a lote (batch) of sales
 */
export interface VentaItemDto {
  productoId: string;
  cantidad: number;
}

/**
 * DTO for registering a batch of sales for one vendedor
 * Backend: POST /eventos/:id/ventas/lote
 */
export interface RegisterVentasLoteDto {
  vendedorId: string;
  items: VentaItemDto[];
}

/**
 * DTO for closing a sale event
 * Backend: POST /eventos/:id/cerrar
 */
export interface CerrarEventoVentaDto {
  medioPago: MedioPagoEnum;
}

/**
 * DTO for registering an ingreso (GRUPO events only)
 * Backend: POST /eventos/:id/ingresos
 */
export interface RegistrarIngresoEventoDto {
  monto: number;
  descripcion: string;
  responsableId: string;
  medioPago: MedioPagoEnum;
}

/**
 * DTO for registering a gasto (both event types)
 * Backend: POST /eventos/:id/gastos
 */
export interface RegistrarGastoEventoDto {
  monto: number;
  descripcion: string;
  responsableId: string;
  medioPago: MedioPagoEnum;
  estadoPago: EstadoPago;
  personaAReembolsarId?: string; // Required if estadoPago === PENDIENTE_REEMBOLSO
}
