import { FilterOperator } from '../filter-operator.enum';

/**
 * Strings centralizados del componente de filtros.
 *
 * Cambiar aquí para traducir o ajustar copy sin tocar templates.
 */
export const FILTER_LABELS = {
  triggerButton: 'Filtrar',
  clearAll: 'Limpiar',
  apply: 'Aplicar',
  noResults: 'Sin resultados',
  searchPlaceholder: 'Buscar filtro...',
  valuePlaceholder: 'Seleccionar valor...',
  openFiltersAria: 'Abrir filtros',
  closeFiltersAria: 'Cerrar filtros',
  dateRangeStartPlaceholder: 'Desde',
  dateRangeEndPlaceholder: 'Hasta',
  unsupportedType: 'Tipo de filtro no soportado en este modo',
} as const;

export const FILTER_OPERATOR_LABELS: Readonly<Record<FilterOperator, string>> = {
  [FilterOperator.IS]: 'es',
  [FilterOperator.IS_NOT]: 'no es',
  [FilterOperator.IS_ANY_OF]: 'es alguno de',
  [FilterOperator.CONTAINS]: 'contiene',
  [FilterOperator.NOT_CONTAINS]: 'no contiene',
  [FilterOperator.BEFORE]: 'antes de',
  [FilterOperator.AFTER]: 'después de',
  [FilterOperator.BETWEEN]: 'entre',
  [FilterOperator.GREATER_THAN]: 'mayor que',
  [FilterOperator.LESS_THAN]: 'menor que',
  [FilterOperator.IS_EMPTY]: 'está vacío',
  [FilterOperator.IS_NOT_EMPTY]: 'no está vacío',
} as const;

export function getOperatorLabel(operator: FilterOperator): string {
  return FILTER_OPERATOR_LABELS[operator];
}

export function buildActiveCountLabel(count: number): string {
  const noun = count === 1 ? 'filtro' : 'filtros';
  return `${count} ${noun}`;
}
