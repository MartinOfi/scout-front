import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BarChartComponent } from '../../../../../shared/components/charts/bar-chart.component';
import { ReporteHorariosEntrega } from '../../../../../shared/models';
import { ReporteSectionComponent } from '../ui/reporte-section.component';
import { ReporteCardComponent } from '../ui/reporte-card.component';

const COLOR_DEFAULT = '#60a5fa';
const COLOR_PICO = '#34d399';
const COLOR_MIN = '#fbbf24';

@Component({
  selector: 'app-reporte-horarios-entrega-section',
  standalone: true,
  imports: [BarChartComponent, ReporteSectionComponent, ReporteCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-reporte-section title="Horarios de entrega" [subtitle]="subtitle()">
      <app-reporte-card>
        @if (labels().length > 0) {
          <app-bar-chart
            [labels]="labels()"
            [values]="values()"
            [colors]="colors()"
            seriesLabel="Porciones"
            [valueFormatter]="porcionesFormatter"
            [axisFormatter]="enteroFormatter"
          />
        } @else {
          <p class="r-muted" style="padding:2rem 0;text-align:center;font-size:13.5px">
            Sin entregas registradas.
          </p>
        }
        @if (horarios().fueraDeDia.length > 0) {
          <p class="r-muted" style="margin-top:12px;font-size:12px">
            {{ fueraDeDiaTotal() }} entrega(s) registradas fuera del día principal
            (excluidas del gráfico): {{ diasFuera() }}.
          </p>
        }
      </app-reporte-card>
    </app-reporte-section>
  `,
})
export class ReporteHorariosEntregaSection {
  readonly horarios = input.required<ReporteHorariosEntrega>();

  protected readonly porcionesFormatter = (v: number): string => `${v} porciones`;
  protected readonly enteroFormatter = (v: number): string => String(v);

  protected subtitle(): string {
    return `${this.horarios().diaPrincipal}, franjas de 30 min (hora AR)`;
  }

  protected labels(): string[] {
    return this.horarios().franjas.map((f) => f.desde);
  }

  protected values(): number[] {
    return this.horarios().franjas.map((f) => f.porciones);
  }

  protected readonly colors = computed<string[]>(() => {
    const porciones = this.horarios().franjas.map((f) => f.porciones);
    if (porciones.length === 0) return [];
    const max = Math.max(...porciones);
    const min = Math.min(...porciones);
    return porciones.map((p) => (p === max ? COLOR_PICO : p === min ? COLOR_MIN : COLOR_DEFAULT));
  });

  protected fueraDeDiaTotal(): number {
    return this.horarios().fueraDeDia.reduce((s, d) => s + d.entregas, 0);
  }

  protected diasFuera(): string {
    return this.horarios().fueraDeDia.map((d) => d.dia).join(', ');
  }
}
