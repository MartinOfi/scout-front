/**
 * Caja-related enums
 * Mirrors backend: src/common/enums/index.ts
 */

/**
 * Types of "cajas" (financial accounts)
 */
export enum CajaType {
  GRUPO = 'grupo',
  RAMA_MANADA = 'rama_manada',
  RAMA_UNIDAD = 'rama_unidad',
  RAMA_CAMINANTES = 'rama_caminantes',
  RAMA_ROVERS = 'rama_rovers',
  PERSONAL = 'personal',
}

/**
 * Labels for CajaType (for UI display)
 */
export const CAJA_TYPE_LABELS: Record<CajaType, string> = {
  [CajaType.GRUPO]: 'Caja de Grupo',
  [CajaType.RAMA_MANADA]: 'Fondo Manada',
  [CajaType.RAMA_UNIDAD]: 'Fondo Unidad',
  [CajaType.RAMA_CAMINANTES]: 'Fondo Caminantes',
  [CajaType.RAMA_ROVERS]: 'Fondo Rovers',
  [CajaType.PERSONAL]: 'Cuenta Personal',
} as const;
