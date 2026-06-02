import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { CHART_GRID_COLOR, chartThemeColors, paletteFor } from './chart-palette';
import { ThemeService } from '../../../core/services/theme.service';

/**
 * Barras reutilizable (Chart.js vía ng2-charts). Soporta barras verticales y
 * un formateador de valores para ejes/tooltip.
 */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative h-[300px] w-full">
      <canvas baseChart type="bar" [data]="data()" [options]="options()"></canvas>
    </div>
  `,
})
export class BarChartComponent {
  readonly labels = input.required<string[]>();
  readonly values = input.required<number[]>();
  readonly colors = input<string[] | null>(null);
  readonly seriesLabel = input<string>('Valor');
  readonly valueFormatter = input<(value: number) => string>((v) => String(v));
  /** Formateador corto para los ticks del eje (ej. "$46k"). */
  readonly axisFormatter = input<(value: number) => string>((v) => String(v));

  private readonly theme = inject(ThemeService);

  protected readonly data = computed<ChartConfiguration<'bar'>['data']>(() => ({
    labels: this.labels(),
    datasets: [
      {
        label: this.seriesLabel(),
        data: this.values(),
        backgroundColor: this.colors() ?? paletteFor(this.values().length),
        borderRadius: 5,
      },
    ],
  }));

  protected readonly options = computed<ChartConfiguration<'bar'>['options']>(() => {
    const fmt = this.valueFormatter();
    const axisFmt = this.axisFormatter();
    const axis = chartThemeColors(this.theme.mode()).axis;
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => fmt(Number(ctx.parsed.y)) } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: axis } },
        y: {
          grid: { color: CHART_GRID_COLOR },
          ticks: { color: axis, callback: (value) => axisFmt(Number(value)) },
        },
      },
    };
  });
}
