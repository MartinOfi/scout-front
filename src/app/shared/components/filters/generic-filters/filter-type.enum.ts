/**
 * Enum para tipos de filtros soportados
 *
 * Basado en las especificaciones del todo.md líneas 57-67
 * Define todos los tipos de filtros que puede renderizar el componente genérico
 */

/**
 * Tipos de filtros soportados por el componente genérico
 */
export enum FilterType {
  /** Dropdown con opciones predefinidas */
  SELECT = 'select',

  /** Selección múltiple con checkboxes */
  MULTI_SELECT = 'multi-select',

  /** Campo de texto libre */
  TEXT = 'text',

  /** Campo numérico con validación */
  NUMBER = 'number',

  /** Selector de fecha */
  DATE = 'date',

  /** Rango de fechas */
  DATE_RANGE = 'date-range',

  /** Checkbox simple */
  BOOLEAN = 'boolean',

  /** Campo de búsqueda con debounce */
  SEARCH = 'search',

  /** Componente personalizado */
  CUSTOM = 'custom',

  /** Filtro tipo chips configurable */
  CHIPS = 'chips',
}
