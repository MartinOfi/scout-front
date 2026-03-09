/**
 * Producto Evento Model
 * Productos que se venden en eventos (rifas, etc.)
 */

export interface ProductoEvento {
  id: string;
  eventoId: string;
  nombre: string;
  costo: number;
  precioVenta: number;
}

export interface CreateProductoEventoDto {
  nombre: string;
  costo: number;
  precioVenta: number;
}
