/**
 * Persona Configuration Constants
 * Single source of truth for PersonaType-related UI configuration
 */

import { PersonaType } from '../enums';

/**
 * Icon mapping for each PersonaType
 * Material Icons - canonical icons for each persona type
 */
export const PERSONA_TYPE_ICONS: Readonly<Record<PersonaType, string>> = {
  [PersonaType.PROTAGONISTA]: 'face',
  [PersonaType.EDUCADOR]: 'school',
  [PersonaType.EXTERNA]: 'person_outline',
  [PersonaType.COLECTIVO]: 'groups',
} as const;

/**
 * Route base paths for each PersonaType
 */
export const PERSONA_TYPE_ROUTES: Readonly<Record<PersonaType, string>> = {
  [PersonaType.PROTAGONISTA]: '/personas/protagonistas',
  [PersonaType.EDUCADOR]: '/personas/educadores',
  [PersonaType.EXTERNA]: '/personas/personas-externas',
  // Un colectivo no es un miembro: no tiene ficha propia. Apunta al listado
  // para no romper el Record exhaustivo con una ruta inventada.
  [PersonaType.COLECTIVO]: '/personas',
} as const;

/**
 * Tab key mapping for PersonaType (for non-Rama persona tabs)
 */
export const PERSONA_TYPE_TAB_KEYS: Readonly<Record<PersonaType, string>> = {
  [PersonaType.PROTAGONISTA]: 'protagonistas',
  [PersonaType.EDUCADOR]: 'educadores',
  [PersonaType.EXTERNA]: 'externos',
  // No tiene solapa propia: los colectivos no se listan entre las personas.
  [PersonaType.COLECTIVO]: '',
} as const;

/**
 * Labels for persona tabs (diferentes a PERSONA_TYPE_LABELS del enum)
 */
export const PERSONA_TAB_LABELS: Readonly<Record<string, string>> = {
  educadores: 'Educadores',
  externos: 'Externos',
  deudores: 'Deudores',
} as const;
