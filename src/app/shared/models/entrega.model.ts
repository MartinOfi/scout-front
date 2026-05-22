/**
 * Entrega models
 * Mirror of backend ENTREGAS feature: tracks product pickups at sale events.
 *
 * Stock disponible = SUM(VentaProducto.cantidad) - SUM(EntregaLinea.cantidad)
 * grouped by (eventoId, productoId, vendedorId).
 */

/**
 * One line inside an Entrega: a product + quantity delivered.
 */
export interface EntregaLineaResponse {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
}

/**
 * Entrega (delivery / pickup header).
 * Backend: GET /eventos/:eventoId/entregas
 */
export interface EntregaResponse {
  id: string;
  eventoId: string;
  vendedorId: string;
  vendedorNombre: string;
  fecha: string | null; // ISO 8601 timestamp (optional)
  notas: string | null;
  createdAt: string; // ISO 8601 timestamp
  lineas: EntregaLineaResponse[];
}

/**
 * Per (producto, vendedor) row in the stock-disponible report.
 * Backend: GET /eventos/:eventoId/entregas/stock-disponible
 */
export interface StockEntregaResponse {
  productoId: string;
  productoNombre: string;
  vendedorId: string;
  vendedorNombre: string;
  cantidadVendida: number;
  cantidadEntregada: number;
  cantidadDisponible: number;
}

/**
 * One line in a CreateEntregaDto.
 */
export interface EntregaItemDto {
  productoId: string;
  cantidad: number;
}

/**
 * DTO for registering an entrega.
 * Backend: POST /eventos/:eventoId/entregas
 *
 * Constraints (enforced server-side):
 * - items array must not contain duplicated productoId
 * - each cantidad must be <= stock disponible of (productoId, vendedorId)
 * - vendedorId must have ventas of every productoId in items
 * - notas max length 500
 */
export interface CreateEntregaDto {
  vendedorId: string;
  fecha?: string; // ISO 8601 timestamp
  notas?: string;
  items: EntregaItemDto[];
}
