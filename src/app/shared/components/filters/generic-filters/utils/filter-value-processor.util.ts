import { FilterConfig } from '../filter-config.interface';
import { FilterType } from '../filter-type.enum';
import { DateRangeValue, FilterValue, FilterValueMap } from '../filter-value.type';

export interface ProcessFormValueParams {
  readonly configs: readonly FilterConfig[];
  readonly formValue: Readonly<Record<string, unknown>>;
}

const DATE_RANGE_START_SUFFIX = 'Start';
const DATE_RANGE_END_SUFFIX = 'End';

export function buildDateRangeControlNames(key: string): {
  readonly startName: string;
  readonly endName: string;
} {
  return {
    startName: `${key}${DATE_RANGE_START_SUFFIX}`,
    endName: `${key}${DATE_RANGE_END_SUFFIX}`,
  };
}

function toOptionalString(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  return value;
}

function extractDateRange(
  formValue: Readonly<Record<string, unknown>>,
  key: string,
): DateRangeValue | null {
  const { startName, endName } = buildDateRangeControlNames(key);
  const startDate = toOptionalString(formValue[startName]);
  const endDate = toOptionalString(formValue[endName]);
  if (startDate === null && endDate === null) {
    return null;
  }
  return { startDate, endDate };
}

/**
 * Convierte los valores crudos de un `FormGroup` a un `FilterValueMap` tipado.
 *
 * - Colapsa los controles `keyStart`/`keyEnd` de DATE_RANGE en `{ startDate, endDate }`.
 * - Omite la key del DATE_RANGE si ambas fechas están vacías.
 * - Preserva el resto de valores tal cual (strings, arrays, booleans).
 */
export function processFormValue(params: ProcessFormValueParams): FilterValueMap {
  const result: Record<string, FilterValue> = {};
  for (const config of params.configs) {
    if (config.type === FilterType.DATE_RANGE) {
      const range = extractDateRange(params.formValue, config.key);
      if (range !== null) {
        result[config.key] = range;
      }
      continue;
    }
    const raw = params.formValue[config.key];
    result[config.key] = (raw ?? null) as FilterValue;
  }
  return result;
}
