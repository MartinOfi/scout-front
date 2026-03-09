/**
 * Venta Por Persona Model
 * Registro de ventas de productos por persona en eventos
 */

export interface VentaPorPersona {
  id: string;
  eventoId: string;
  personaId: string;
  productoId: string;
  cantidad: number;
  precioVenta: number;
  costo: number;
}

export interface VentaDto {
  productoId: string;
  cantidad: number;
}
