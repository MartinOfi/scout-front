import { Pipe, PipeTransform } from '@angular/core';

/**
 * Money pipe
 *
 * Single source of truth for monetary formatting across the app.
 * Uses Argentine Spanish locale ('es-AR'): `.` as thousands separator
 * and `,` as decimal separator, with `$` as the currency symbol.
 *
 * Defaults to 0 decimals (matches the dominant display convention in
 * the app). Pass `2` as the first argument for amounts that need cents.
 *
 * Null, undefined and NaN render as a placeholder (default: `'-'`),
 * so templates don't need to guard against missing data.
 *
 * @example
 *   {{ 1234567      | money    }}   → '$ 1.234.567'
 *   {{ 1234.56      | money:2  }}   → '$ 1.234,56'
 *   {{ null         | money    }}   → '-'
 *   {{ inscripcion.saldoPendiente | money:2:'Sin datos' }}
 */
@Pipe({
  name: 'money',
  standalone: true,
})
export class MoneyPipe implements PipeTransform {
  transform(
    value: number | null | undefined,
    decimals: 0 | 2 = 0,
    emptyPlaceholder: string = '-',
  ): string {
    return formatMoney(value, decimals, emptyPlaceholder);
  }
}

/**
 * Utility function for use outside templates (e.g., in report generation
 * or `.ts` files where a pipe is not ergonomic). Mirrors MoneyPipe exactly.
 */
export function formatMoney(
  value: number | null | undefined,
  decimals: 0 | 2 = 0,
  emptyPlaceholder: string = '-',
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return emptyPlaceholder;
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
