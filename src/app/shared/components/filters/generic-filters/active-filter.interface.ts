import { FilterOperator } from './filter-operator.enum';
import { FilterType } from './filter-type.enum';
import { FilterValue } from './filter-value.type';

/**
 * Representación de un filtro activo (aplicado) en el UI.
 *
 * Inmutable. Para actualizar un campo, construir una nueva instancia con spread.
 */
export interface ActiveFilter {
  readonly key: string;
  readonly type: FilterType;
  readonly label: string;
  readonly operator: FilterOperator;
  readonly value: FilterValue;
}
