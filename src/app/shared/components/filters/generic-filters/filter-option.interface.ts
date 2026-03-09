/**
 * Interfaz para opciones de filtros
 *
 * Basado en las especificaciones del todo.md líneas 25-42
 * Define la estructura de opciones para filtros de tipo SELECT y MULTI_SELECT
 */

/**
 * Interfaz para una opción de filtro
 *
 * Representa una opción individual dentro de un filtro de tipo SELECT o MULTI_SELECT
 */
export interface FilterOption {
  /** Valor de la opción */
  value: any;

  /** Etiqueta visible de la opción */
  label: string;

  /** Si la opción está deshabilitada (opcional) */
  disabled?: boolean;

  /** Datos adicionales de la opción (opcional) */
  data?: any;
}
