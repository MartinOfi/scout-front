import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { MoneyPipe } from '../../../../../shared/pipes/money.pipe';
import { DonutChartComponent } from '../../../../../shared/components/charts/donut-chart.component';
import { ReportePorRama } from '../../../../../shared/models';
import {
  CHART_COLOR_EDUCADOR,
  paletteFor,
} from '../../../../../shared/components/charts/chart-palette';
import { ReporteSectionComponent } from '../ui/reporte-section.component';
import { ReporteCardComponent } from '../ui/reporte-card.component';
import { formatArs } from '../reporte-format';

@Component({
  selector: 'app-reporte-participacion-rama-section',
  standalone: true,
  imports: [
    PercentPipe,
    MoneyPipe,
    DonutChartComponent,
    ReporteSectionComponent,
    ReporteCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-reporte-section
      title="Participación por rama"
      subtitle="protagonistas por rama + educadores aparte"
    >
      <div class="r-grid r-grid--58">
        <app-reporte-card>
          <app-donut-chart
            [labels]="labels()"
            [values]="values()"
            [colors]="colors()"
            [valueFormatter]="formatArs"
          />
        </app-reporte-card>
        <app-reporte-card>
          <div class="r-scroll">
            <table class="r-table r-table--min">
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th class="num">Vend.</th>
                  <th class="num">Unid.</th>
                  <th class="num">Recaudado</th>
                  <th class="num">%</th>
                </tr>
              </thead>
              <tbody>
                @for (r of porRama(); track r.grupo) {
                  <tr>
                    <td>{{ r.grupo }}</td>
                    <td class="num">{{ r.vendedores }}</td>
                    <td class="num">{{ r.unidades }}</td>
                    <td class="num">{{ r.recaudado | money }}</td>
                    <td class="num">{{ r.porcentaje | percent: '1.0-1' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-reporte-card>
      </div>
    </app-reporte-section>
  `,
})
export class ReporteParticipacionRamaSection {
  readonly porRama = input.required<ReportePorRama[]>();
  protected readonly formatArs = formatArs;

  protected labels(): string[] {
    return this.porRama().map((r) => r.grupo);
  }

  protected values(): number[] {
    return this.porRama().map((r) => r.recaudado);
  }

  protected colors(): string[] {
    const base = paletteFor(this.porRama().length);
    return this.porRama().map((r, i) => (r.esEducador ? CHART_COLOR_EDUCADOR : base[i]));
  }
}
