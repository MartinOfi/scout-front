/**
 * Operadores de comparación soportados por los filtros.
 *
 * Cada {@link FilterType} tiene un subset válido definido en
 * `config/filter-operators.config.ts`.
 */
export enum FilterOperator {
  IS = 'is',
  IS_NOT = 'is_not',
  IS_ANY_OF = 'is_any_of',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  BEFORE = 'before',
  AFTER = 'after',
  BETWEEN = 'between',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
}
