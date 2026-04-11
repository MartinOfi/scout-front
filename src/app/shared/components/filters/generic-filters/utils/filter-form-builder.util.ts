import { FilterConfig } from '../filter-config.interface';
import { FilterType } from '../filter-type.enum';
import { DateRangeValue } from '../filter-value.type';
import { buildDateRangeControlNames } from './filter-value-processor.util';

/**
 * Especificación declarativa de un control de formulario.
 *
 * Se pasa a `FormBuilder.group()` en el componente — esta util queda pura
 * (testeable sin TestBed).
 */
export interface FormControlSpec {
  readonly name: string;
  readonly defaultValue: string;
}

function extractDateRangeDefaults(
  defaultValue: Partial<DateRangeValue> | undefined,
): { readonly start: string; readonly end: string } {
  return {
    start: defaultValue?.startDate ?? '',
    end: defaultValue?.endDate ?? '',
  };
}

function buildDateRangeSpecs(config: FilterConfig): readonly FormControlSpec[] {
  const { startName, endName } = buildDateRangeControlNames(config.key);
  const { start, end } = extractDateRangeDefaults(
    config.defaultValue as Partial<DateRangeValue> | undefined,
  );
  return [
    { name: startName, defaultValue: start },
    { name: endName, defaultValue: end },
  ];
}

function buildScalarSpec(config: FilterConfig): FormControlSpec {
  const raw = config.defaultValue;
  const defaultValue = typeof raw === 'string' ? raw : raw == null ? '' : String(raw);
  return { name: config.key, defaultValue };
}

/**
 * Construye la lista de especificaciones de controles para un conjunto de filtros.
 *
 * - DATE_RANGE genera 2 specs: `${key}Start` y `${key}End`.
 * - Cualquier otro tipo genera 1 spec con el defaultValue o `''`.
 */
export function buildFormControlSpecs(
  configs: readonly FilterConfig[],
): readonly FormControlSpec[] {
  const result: FormControlSpec[] = [];
  for (const config of configs) {
    if (config.type === FilterType.DATE_RANGE) {
      result.push(...buildDateRangeSpecs(config));
      continue;
    }
    result.push(buildScalarSpec(config));
  }
  return result;
}
