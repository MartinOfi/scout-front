import { DateRangeValue, FilterValue, FilterValueMap } from '../filter-value.type';

function isDateRange(value: unknown): value is DateRangeValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'startDate' in value &&
    'endDate' in value
  );
}

/**
 * Retorna true si un valor de filtro es considerado "activo".
 *
 * Reglas:
 * - null / undefined / '' / false → inactivo
 * - arrays vacíos → inactivo
 * - date range sin ninguna fecha → inactivo
 * - cualquier otra cosa (incluyendo 0 y true) → activo
 */
export function hasActiveValue(value: FilterValue | undefined): boolean {
  if (value === null || value === undefined || value === '' || value === false) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (isDateRange(value)) {
    return Boolean(value.startDate) || Boolean(value.endDate);
  }
  return true;
}

/**
 * Cuenta cuántos filtros están activos en un mapa.
 */
export function countActive(filters: FilterValueMap): number {
  return Object.values(filters).filter(hasActiveValue).length;
}
