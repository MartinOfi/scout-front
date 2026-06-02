import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { MoneyPipe } from '../../../../../shared/pipes/money.pipe';
import { BarChartComponent } from '../../../../../shared/components/charts/bar-chart.component';
import { ReportePorTipoPersona } from '../../../../../shared/models';
import { PersonaType } from '../../../../../shared/enums/persona.enum';
import {
  CHART_COLOR_EDUCADOR,
  CHART_COLOR_PROTAGONISTA,
} from '../../../../../shared/components/charts/chart-palette';
import { ReporteSectionComponent } from '../ui/reporte-section.component';
import { ReporteCardComponent } from '../ui/reporte-card.component';
import { formatArs, formatArsShort } from '../reporte-format';

@Component({
  selector: 'app-reporte-por-tipo-persona-section',
  standalone: true,
  imports: [
    PercentPipe,
    MoneyPipe,
    BarChartComponent,
    ReporteSectionComponent,
    ReporteCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-reporte-section title="Recaudación por tipo de persona">
      <div class="r-grid r-grid--58">
        <app-reporte-card>
          <app-bar-chart
            [labels]="labels()"
            [values]="values()"
            [colors]="colors()"
            seriesLabel="Recaudado"
            [valueFormatter]="formatArs"
            [axisFormatter]="formatArsShort"
          />
        </app-reporte-card>
        <app-reporte-card>
          <div class="r-scroll">
            <table class="r-table r-table--min">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th class="num">Vend.</th>
                  <th class="num">Unid.</th>
                  <th class="num">Recaudado</th>
                  <th class="num">%</th>
                </tr>
              </thead>
              <tbody>
                @for (t of porTipo(); track t.tipo) {
                  <tr>
                    <td>{{ t.label }}</td>
                    <td class="num">{{ t.vendedores }}</td>
                    <td class="num">{{ t.unidades }}</td>
                    <td class="num">{{ t.recaudado | money }}</td>
                    <td class="num">{{ t.porcentaje | percent: '1.0-1' }}</td>
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
export class ReportePorTipoPersonaSection {
  readonly porTipo = input.required<ReportePorTipoPersona[]>();
  protected readonly formatArs = formatArs;
  protected readonly formatArsShort = formatArsShort;

  protected labels(): string[] {
    return this.porTipo().map((t) => t.label);
  }

  protected values(): number[] {
    return this.porTipo().map((t) => t.recaudado);
  }

  protected colors(): string[] {
    return this.porTipo().map((t) =>
      t.tipo === PersonaType.EDUCADOR ? CHART_COLOR_EDUCADOR : CHART_COLOR_PROTAGONISTA,
    );
  }
}
