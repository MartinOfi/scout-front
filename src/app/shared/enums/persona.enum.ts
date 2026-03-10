/**
 * Persona-related enums
 * Mirrors backend: src/common/enums/index.ts
 */

/**
 * Types of people in the system (Single Table Inheritance discriminator)
 */
export enum PersonaType {
  PROTAGONISTA = 'protagonista',
  EDUCADOR = 'educador',
  EXTERNA = 'externo',
}

/**
 * Labels for PersonaType
 */
export const PERSONA_TYPE_LABELS: Record<PersonaType, string> = {
  [PersonaType.PROTAGONISTA]: 'Protagonista',
  [PersonaType.EDUCADOR]: 'Educador',
  [PersonaType.EXTERNA]: 'Persona Externa',
} as const;

/**
 * States of a persona
 */
export enum EstadoPersona {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

/**
 * Labels for EstadoPersona
 */
export const ESTADO_PERSONA_LABELS: Record<EstadoPersona, string> = {
  [EstadoPersona.ACTIVO]: 'Activo',
  [EstadoPersona.INACTIVO]: 'Inactivo',
} as const;

/**
 * Scout branches (Ramas)
 */
export const RAMAS = ['Manada', 'Unidad', 'Caminantes', 'Rovers'] as const;
export type Rama = (typeof RAMAS)[number];

export enum RamaEnum {
  MANADA = 'Manada',
  UNIDAD = 'Unidad',
  CAMINANTES = 'Caminantes',
  ROVERS = 'Rovers',
}

/**
 * Labels for Rama (for UI display)
 */
export const RAMA_LABELS: Record<Rama, string> = {
  'Manada': 'Manada',
  'Unidad': 'Unidad',
  'Caminantes': 'Caminantes',
  'Rovers': 'Rovers',
} as const;

/**
 * Cargos de educadores
 * Synced with backend: CargoEducador enum
 */
export enum CargoEducador {
  EDUCADOR = 'Educador',
  JEFE_DE_RAMA = 'Jefe de Rama',
  JEFE_DE_GRUPO = 'Jefe de Grupo',
}

export const CARGOS_EDUCADOR = Object.values(CargoEducador);

/**
 * Labels for CargoEducador (for UI display)
 */
export const CARGO_EDUCADOR_LABELS: Record<CargoEducador, string> = {
  [CargoEducador.EDUCADOR]: 'Educador',
  [CargoEducador.JEFE_DE_RAMA]: 'Jefe de Rama',
  [CargoEducador.JEFE_DE_GRUPO]: 'Jefe de Grupo',
} as const;
