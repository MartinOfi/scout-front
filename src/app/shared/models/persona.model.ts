/**
 * Persona models
 * Typed interfaces - NO any
 * Synced with backend API: docs/API_REFERENCE.md
 */

import { PersonaType, EstadoPersona, Rama, CargoEducador } from '../enums';

/**
 * Base persona interface (abstract)
 * Matches backend Persona entity
 */
export interface Persona {
  id: string;
  tipo: PersonaType;
  nombre: string;
  estado: EstadoPersona;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Protagonista - Scout youth member
 */
export interface Protagonista extends Persona {
  tipo: PersonaType.PROTAGONISTA;
  rama: Rama;
  // Documentación entregada
  partidaNacimiento: boolean;
  dni: boolean;
  dniPadres: boolean;
  carnetObraSocial: boolean;
}

/**
 * Educador - Scout leader
 */
export interface Educador extends Persona {
  tipo: PersonaType.EDUCADOR;
  rama: Rama | null;
  cargo: CargoEducador;
}

/**
 * PersonaExterna - External person (e.g., parent who helps)
 */
export interface PersonaExterna extends Persona {
  tipo: PersonaType.EXTERNA;
  contacto: string | null;
  notas: string | null;
}

/**
 * Union type for all persona types
 */
export type PersonaUnion = Protagonista | Educador | PersonaExterna;

/**
 * DTO for creating a protagonista
 * Backend: POST /personas/protagonistas
 */
export interface CreateProtagonistaDto {
  nombre: string;
  rama: Rama;
  // Documentación entregada (opcionales, default: false)
  partidaNacimiento?: boolean;
  dni?: boolean;
  dniPadres?: boolean;
  carnetObraSocial?: boolean;
}

/**
 * DTO for creating an educador
 * Backend: POST /personas/educadores
 */
export interface CreateEducadorDto {
  nombre: string;
  rama?: Rama;
  cargo: CargoEducador;
}

/**
 * DTO for creating a persona externa
 * Backend: POST /personas/externas
 */
export interface CreatePersonaExternaDto {
  nombre: string;
  contacto?: string;
  notas?: string;
}

/**
 * DTO for updating any persona
 * Backend: PATCH /personas/:id
 */
export interface UpdatePersonaDto {
  nombre?: string;
  estado?: EstadoPersona;
  rama?: Rama;
  cargo?: CargoEducador;
  contacto?: string;
  notas?: string;
  // Documentación entregada (protagonistas)
  partidaNacimiento?: boolean;
  dni?: boolean;
  dniPadres?: boolean;
  carnetObraSocial?: boolean;
}
