/**
 * Evento models
 * Typed interfaces - NO any
 */

import { TipoEvento, DestinoGanancia } from '../enums';
import { Persona } from './persona.model';

/**
 * Evento (Sale event or group event)
 */
export interface Evento {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoEvento;
  fecha: Date;
  destinoGanancia?: DestinoGanancia; // Only for sale events
  productos?: Producto[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Evento with financial summary
 */
export interface EventoConResumen extends Evento {
  totalIngresos: number;
  totalEgresos: number;
  resultadoNeto: number;
  participantes?: ParticipanteEvento[];
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
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Venta de Producto (Sale record)
 */
export interface VentaProducto {
  id: string;
  productoId: string;
  producto?: Producto;
  personaId: string;
  persona?: Persona;
  cantidad: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Participant in event with sales
 */
export interface ParticipanteEvento {
  personaId: string;
  personaNombre: string;
  ventas: VentaProducto[];
  gananciaTotal: number;
}

/**
 * DTO for creating an evento
 */
export interface CreateEventoDto {
  nombre: string;
  descripcion?: string;
  tipo: TipoEvento;
  fecha: string; // ISO date string
  destinoGanancia?: DestinoGanancia;
}

/**
 * DTO for updating an evento
 */
export interface UpdateEventoDto {
  nombre?: string;
  descripcion?: string;
  fecha?: string;
  destinoGanancia?: DestinoGanancia;
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
 * DTO for creating a venta de producto
 */
export interface CreateVentaProductoDto {
  productoId: string;
  personaId: string;
  cantidad: number;
}
