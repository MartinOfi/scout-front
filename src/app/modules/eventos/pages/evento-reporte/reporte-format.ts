/** Formateadores compartidos por las secciones del reporte. */

export function formatArs(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-AR');
}

/** Formato corto para ejes de charts: $46k, $1.2M. */
export function formatArsShort(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return '$' + (value / 1_000_000).toFixed(1).replace('.', ',') + 'M';
  }
  if (Math.abs(value) >= 1000) {
    return '$' + Math.round(value / 1000) + 'k';
  }
  return '$' + value;
}

export function formatPct(ratio: number): string {
  return (ratio * 100).toLocaleString('es-AR', { maximumFractionDigits: 1 }) + '%';
}
