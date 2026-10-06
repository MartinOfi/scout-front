import { EstadoPersona } from '../enums';

/** Cualquier cosa que exponga el estado de una persona (persona, propietario de caja, etc.). */
interface ConEstado {
  estado?: EstadoPersona;
}

/**
 * Un deshabilitado (estado inactivo) no se ofrece en los selectores para crear
 * algo nuevo, pero sigue apareciendo en todo registro histórico o vinculado.
 */
export function esPersonaDeshabilitada(persona: ConEstado): boolean {
  return persona.estado === EstadoPersona.INACTIVO;
}

export function soloHabilitadas<T extends ConEstado>(personas: readonly T[]): T[] {
  return personas.filter((persona) => !esPersonaDeshabilitada(persona));
}
