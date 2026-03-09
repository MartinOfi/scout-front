/**
 * Rama Configuration Constants
 * Single source of truth for Rama-related UI configuration
 */

import { Rama, RamaEnum, RAMAS } from '../enums';
import { TabConfig } from '../components/button-tabs/button-tabs.component';

/**
 * Icon mapping for each Rama
 * Material Icons - canonical icons for each branch
 *
 * Rationale:
 * - Manada (cubs): 'pets' - playful, young children nature
 * - Unidad (scouts): 'hiking' - outdoor activities, exploration
 * - Caminantes (rangers): 'directions_walk' - walking/journeying theme
 * - Rovers (rovers): 'explore' - adventure and discovery
 */
export const RAMA_ICONS: Readonly<Record<Rama, string>> = {
  [RamaEnum.MANADA]: 'pets',
  [RamaEnum.UNIDAD]: 'hiking',
  [RamaEnum.CAMINANTES]: 'directions_walk',
  [RamaEnum.ROVERS]: 'explore',
} as const;

/**
 * Lowercase key mapping for tabs/routes
 * Used for URL-friendly identifiers
 */
export const RAMA_TAB_KEYS: Readonly<Record<Rama, string>> = {
  [RamaEnum.MANADA]: 'manada',
  [RamaEnum.UNIDAD]: 'unidad',
  [RamaEnum.CAMINANTES]: 'caminantes',
  [RamaEnum.ROVERS]: 'rovers',
} as const;

/**
 * Reverse lookup: lowercase key to Rama enum value
 */
export const TAB_KEY_TO_RAMA: Readonly<Record<string, Rama>> = {
  manada: RamaEnum.MANADA,
  unidad: RamaEnum.UNIDAD,
  caminantes: RamaEnum.CAMINANTES,
  rovers: RamaEnum.ROVERS,
} as const;

/**
 * Type for valid Rama tab keys
 */
export type RamaTabKey = (typeof RAMA_TAB_KEYS)[Rama];

/**
 * Generate TabConfig array for all Ramas
 * Uses RAMAS const to ensure consistency
 */
export function generateRamaTabs(): TabConfig[] {
  return RAMAS.map((rama) => ({
    key: RAMA_TAB_KEYS[rama],
    label: rama,
    icon: RAMA_ICONS[rama],
  }));
}

/**
 * Check if a tab key corresponds to a Rama
 */
export function isRamaTabKey(key: string): key is RamaTabKey {
  return key in TAB_KEY_TO_RAMA;
}

/**
 * Get Rama from tab key, returns undefined if not a Rama tab
 */
export function getRamaFromTabKey(key: string): Rama | undefined {
  return TAB_KEY_TO_RAMA[key];
}
