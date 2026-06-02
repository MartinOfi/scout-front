import { THEME_MODE, type ThemeMode } from '../../constants/theme.constants';

/**
 * Paleta y helpers compartidos para los charts del reporte.
 * Coincide con la del reporte HTML para mantener consistencia visual.
 */
export const CHART_PALETTE = [
  '#60a5fa',
  '#34d399',
  '#fbbf24',
  '#a78bfa',
  '#f472b6',
  '#22d3ee',
  '#fb7185',
  '#a3e635',
] as const;

/** Color por tipo de persona (educador rosa / protagonista azul). */
export const CHART_COLOR_EDUCADOR = '#f472b6';
export const CHART_COLOR_PROTAGONISTA = '#60a5fa';

/** Grid semi-transparente legible en claro y oscuro. */
export const CHART_GRID_COLOR = 'rgba(127,127,127,0.18)';

export function paletteFor(count: number): string[] {
  return Array.from({ length: count }, (_, i) => CHART_PALETTE[i % CHART_PALETTE.length]);
}

/**
 * Colores del chart dependientes del tema. Chart.js dibuja en canvas y no puede
 * leer variables CSS, así que resolvemos los colores cromáticamente: el texto de
 * ejes/leyenda y el borde de las porciones (que debe igualar el fondo del panel)
 * cambian con el modo claro/oscuro de la app.
 */
export interface ChartThemeColors {
  /** Texto de ticks de eje y labels de leyenda. */
  readonly axis: string;
  /** Borde entre porciones del donut: iguala el fondo del panel/card. */
  readonly surface: string;
}

export function chartThemeColors(mode: ThemeMode): ChartThemeColors {
  return mode === THEME_MODE.Dark
    ? { axis: '#8d9bbd', surface: '#141b30' }
    : { axis: '#64748b', surface: '#ffffff' };
}
