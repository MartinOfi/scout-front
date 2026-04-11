import { FilterOperator } from '../filter-operator.enum';
import { FilterType } from '../filter-type.enum';

/**
 * Mapea cada {@link FilterType} a la lista de operadores válidos.
 *
 * El primer operador de cada lista es el default al agregar un filtro.
 */
export const FILTER_OPERATORS_BY_TYPE: Readonly<Record<FilterType, readonly FilterOperator[]>> = {
  [FilterType.SELECT]: [FilterOperator.IS, FilterOperator.IS_NOT],
  [FilterType.MULTI_SELECT]: [FilterOperator.IS_ANY_OF, FilterOperator.IS_NOT],
  [FilterType.TEXT]: [
    FilterOperator.CONTAINS,
    FilterOperator.NOT_CONTAINS,
    FilterOperator.IS_EMPTY,
    FilterOperator.IS_NOT_EMPTY,
  ],
  [FilterType.SEARCH]: [FilterOperator.CONTAINS],
  [FilterType.NUMBER]: [
    FilterOperator.IS,
    FilterOperator.GREATER_THAN,
    FilterOperator.LESS_THAN,
  ],
  [FilterType.DATE]: [FilterOperator.IS, FilterOperator.BEFORE, FilterOperator.AFTER],
  [FilterType.DATE_RANGE]: [FilterOperator.BETWEEN],
  [FilterType.BOOLEAN]: [FilterOperator.IS],
  [FilterType.CHIPS]: [FilterOperator.IS, FilterOperator.IS_ANY_OF],
  [FilterType.CUSTOM]: [FilterOperator.IS],
} as const;

export function getDefaultOperator(type: FilterType): FilterOperator {
  return FILTER_OPERATORS_BY_TYPE[type][0];
}

export interface OperatorValidationParams {
  readonly type: FilterType;
  readonly operator: FilterOperator;
}

export function isOperatorValidForType(params: OperatorValidationParams): boolean {
  return FILTER_OPERATORS_BY_TYPE[params.type].includes(params.operator);
}
