/**
 * Inscripcion models
 * Typed interfaces - NO any
 */

import { TipoInscripcion, EstadoInscripcion } from '../enums';
import { Persona } from './persona.model';

/**
 * Inscripcion (Scout group or Scout Argentina annual registration)
 */
export interface Inscripcion {
  id: string;
  personaId: string;
  persona?: Persona;
  tipo: TipoInscripcion;
  ano: number;
  montoTotal: number;
  montoBonificado: number;
  declaracionDeSalud: boolean;
  autorizacionDeImagen: boolean;
  salidasCercanas: boolean;
  autorizacionIngreso: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Inscripcion with calculated payment state (returned by GET /:id)
 */
export interface InscripcionConEstado {
  inscripcion: Inscripcion;
  montoPagado: number;
  estado: EstadoInscripcion;
}

/**
 * DTO for creating an inscripcion
 */
export interface CreateInscripcionDto {
  personaId: string;
  tipo: TipoInscripcion;
  ano: number;
  montoTotal: number;
  montoBonificado?: number;
  declaracionDeSalud?: boolean;
  autorizacionDeImagen?: boolean;
  salidasCercanas?: boolean;
  autorizacionIngreso?: boolean;
}

/**
 * DTO for updating an inscripcion
 */
export interface UpdateInscripcionDto {
  montoBonificado?: number;
  declaracionDeSalud?: boolean;
  autorizacionDeImagen?: boolean;
  salidasCercanas?: boolean;
  autorizacionIngreso?: boolean;
}
