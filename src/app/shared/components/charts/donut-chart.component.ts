import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { chartThemeColors, paletteFor } from './chart-palette';
import { ThemeService } from '../../../core/services/theme.service';

/**
 * Dona reutilizable (Chart.js vía ng2-charts). Desacopla las secciones del
 * reporte de la librería de gráficos: reciben labels/values, no tocan Chart.js.
 */
@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative h-[300px] w-full">
      <canvas baseChart type="doughnut" [data]="data()" [options]="options()"></canvas>
    </div>
  `,
})
export class DonutChartComponent {
  readonly labels = input.required<string[]>();
  readonly values = input.required<number[]>();
  readonly colors = input<string[] | null>(null);
  /** Formateador de valores para el tooltip (ej. moneda). */
  readonly valueFormatter = input<(value: number) => string>((v) => String(v));

  private readonly theme = inject(ThemeService);

  protected readonly data = computed<ChartConfiguration<'doughnut'>['data']>(() => ({
    labels: this.labels(),
    datasets: [
      {
        data: this.values(),
        backgroundColor: this.colors() ?? paletteFor(this.values().length),
        borderColor: chartThemeColors(this.theme.mode()).surface,
        borderWidth: 2,
      },
    ],
  }));

  protected readonly options = computed<ChartConfiguration<'doughnut'>['options']>(() => {
    const fmt = this.valueFormatter();
    const axis = chartThemeColors(this.theme.mode()).axis;
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: { position: 'bottom', labels: { color: axis } },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((s: number, n) => s + Number(n), 0);
              const value = Number(ctx.parsed);
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return `${ctx.label}: ${fmt(value)} (${pct.replace('.', ',')}%)`;
            },
          },
        },
      },
    };
  });
}
