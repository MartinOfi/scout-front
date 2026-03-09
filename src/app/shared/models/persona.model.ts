/**
 * Persona models
 * Typed interfaces - NO any
 */

import { PersonaType, EstadoPersona, Rama } from '../enums';

/**
 * Base persona interface (abstract)
 */
export interface Persona {
  id: string;
  tipo: PersonaType;
  nombre: string;
  apellido: string;
  dni: string;
  estado: EstadoPersona;
  fechaIngreso: Date;
  cuentaPersonalId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Protagonista - Scout youth member
 */
export interface Protagonista extends Persona {
  tipo: PersonaType.PROTAGONISTA;
  rama: Rama;
  fueBonificado: boolean;
}

/**
 * Educador - Scout leader
 */
export interface Educador extends Persona {
  tipo: PersonaType.EDUCADOR;
  rama?: Rama;
  cargo?: string;
}

/**
 * PersonaExterna - External person (e.g., parent who helps)
 */
export interface PersonaExterna extends Persona {
  tipo: PersonaType.EXTERNA;
  relacion?: string;
  contacto?: string;
  notas?: string;
}

/**
 * Union type for all persona types
 */
export type PersonaUnion = Protagonista | Educador | PersonaExterna;

/**
 * DTO for creating a protagonista
 */
export interface CreateProtagonistaDto {
  nombre: string;
  apellido: string;
  dni: string;
  rama: Rama;
  fechaIngreso: string;
}

/**
 * DTO for creating an educador
 */
export interface CreateEducadorDto {
  nombre: string;
  apellido: string;
  dni: string;
  fechaIngreso: string;
  rama?: Rama;
  cargo?: string;
}

/**
 * DTO for creating a persona externa
 */
export interface CreatePersonaExternaDto {
  nombre: string;
  apellido: string;
  dni: string;
  fechaIngreso?: string;
  relacion?: string;
  contacto?: string;
  notas?: string;
}

/**
 * DTO for updating any persona
 */
export interface UpdatePersonaDto {
  nombre?: string;
  apellido?: string;
  dni?: string;
  estado?: EstadoPersona;
  fechaIngreso?: string;
  rama?: Rama;
  cargo?: string;
  relacion?: string;
  contacto?: string;
  notas?: string;
}
