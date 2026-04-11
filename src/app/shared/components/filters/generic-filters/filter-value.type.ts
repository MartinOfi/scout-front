/**
 * Tipos estrictos para valores de filtros.
 *
 * Reemplaza el uso de `any` en el componente legacy.
 */

export interface DateRangeValue {
  readonly startDate: string | null;
  readonly endDate: string | null;
}

export type FilterPrimitive = string | number | boolean | null;

export type FilterValue = FilterPrimitive | readonly FilterPrimitive[] | DateRangeValue;

export type FilterValueMap = Readonly<Record<string, FilterValue>>;
