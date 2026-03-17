/**
 * Rama Configuration
 * Centralized configuration for rama-specific styling across the application.
 * This file provides consistent colors, icons, and variants for all rama-related UI components.
 */

import { RamaEnum } from '../enums/persona.enum';
import { CajaType } from '../enums/caja.enum';
import { StatCardVariant } from '../components/stat-card/stat-card.component';

/**
 * Rama color variants mapping
 * Maps each rama to a stat-card variant for consistent coloring:
 * - Manada: warning (yellow/orange)
 * - Unidad: success (green)
 * - Caminantes: info (blue)
 * - Rovers: danger (red)
 */
export const RAMA_VARIANTS: Record<RamaEnum, StatCardVariant> = {
  [RamaEnum.MANADA]: 'warning',
  [RamaEnum.UNIDAD]: 'success',
  [RamaEnum.CAMINANTES]: 'info',
  [RamaEnum.ROVERS]: 'danger',
} as const;

/**
 * CajaType to StatCardVariant mapping
 * For caja-rama components that use CajaType instead of RamaEnum
 */
export const CAJA_RAMA_VARIANTS: Partial<Record<CajaType, StatCardVariant>> = {
  [CajaType.RAMA_MANADA]: 'warning',
  [CajaType.RAMA_UNIDAD]: 'success',
  [CajaType.RAMA_CAMINANTES]: 'info',
  [CajaType.RAMA_ROVERS]: 'danger',
} as const;

/**
 * Rama icons mapping
 * Material icons for each rama
 */
export const RAMA_ICONS: Record<RamaEnum, string> = {
  [RamaEnum.MANADA]: 'pets',
  [RamaEnum.UNIDAD]: 'hiking',
  [RamaEnum.CAMINANTES]: 'landscape',
  [RamaEnum.ROVERS]: 'explore',
} as const;

/**
 * CajaType to icon mapping
 * Material icons for each caja type (includes non-rama types)
 */
export const CAJA_ICONS: Record<CajaType, string> = {
  [CajaType.RAMA_MANADA]: 'pets',
  [CajaType.RAMA_UNIDAD]: 'hiking',
  [CajaType.RAMA_CAMINANTES]: 'landscape',
  [CajaType.RAMA_ROVERS]: 'explore',
  [CajaType.GRUPO]: 'account_balance',
  [CajaType.PERSONAL]: 'person',
} as const;

/**
 * Rama chip colors for chips-filter component
 * Hex colors for backgroundColor and textColor when chip is active
 */
export const RAMA_CHIP_COLORS: Record<RamaEnum, { backgroundColor: string; textColor: string }> = {
  [RamaEnum.MANADA]: { backgroundColor: '#f59e0b', textColor: '#ffffff' },
  [RamaEnum.UNIDAD]: { backgroundColor: '#16a34a', textColor: '#ffffff' },
  [RamaEnum.CAMINANTES]: { backgroundColor: '#2563eb', textColor: '#ffffff' },
  [RamaEnum.ROVERS]: { backgroundColor: '#dc2626', textColor: '#ffffff' },
} as const;

/**
 * CajaType chip colors for chips-filter component
 */
export const CAJA_RAMA_CHIP_COLORS: Partial<
  Record<CajaType, { backgroundColor: string; textColor: string }>
> = {
  [CajaType.RAMA_MANADA]: { backgroundColor: '#f59e0b', textColor: '#ffffff' },
  [CajaType.RAMA_UNIDAD]: { backgroundColor: '#16a34a', textColor: '#ffffff' },
  [CajaType.RAMA_CAMINANTES]: { backgroundColor: '#2563eb', textColor: '#ffffff' },
  [CajaType.RAMA_ROVERS]: { backgroundColor: '#dc2626', textColor: '#ffffff' },
} as const;

/**
 * Rama CSS classes mapping
 * Tailwind-compatible CSS classes for rama-specific styling
 */
export const RAMA_CSS_CLASSES: Record<RamaEnum, { bg: string; text: string; border: string }> = {
  [RamaEnum.MANADA]: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
  },
  [RamaEnum.UNIDAD]: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
  },
  [RamaEnum.CAMINANTES]: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
  },
  [RamaEnum.ROVERS]: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
  },
} as const;

/**
 * Helper function to get variant for a rama
 */
export function getRamaVariant(rama: RamaEnum): StatCardVariant {
  return RAMA_VARIANTS[rama];
}

/**
 * Helper function to get variant for a caja type
 * Returns 'info' as default for non-rama caja types
 */
export function getCajaRamaVariant(cajaType: CajaType): StatCardVariant {
  return CAJA_RAMA_VARIANTS[cajaType] ?? 'info';
}
