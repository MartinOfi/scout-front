import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MoneyPipe } from '../../../../../shared/pipes/money.pipe';
import { ReporteKpis } from '../../../../../shared/models';
import { ReporteSectionComponent } from '../ui/reporte-section.component';
import { ReporteCardComponent } from '../ui/reporte-card.component';

@Component({
  selector: 'app-reporte-resultado-economico-section',
  standalone: true,
  imports: [MoneyPipe, ReporteSectionComponent, ReporteCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-reporte-section title="Resultado económico">
      <app-reporte-card>
        <div class="r-flow">
          <div class="r-flowrow r-flowrow--pos">
            <span class="r-flowrow__lbl">Recaudación bruta</span>
            <span class="r-flowrow__amt">{{ kpis().recaudacionBruta | money }}</span>
          </div>
          <div class="r-flowrow r-flowrow--neg">
            <span class="r-flowrow__lbl">− Egresos reales (insumos)</span>
            <span class="r-flowrow__amt">−{{ kpis().egresos | money }}</span>
          </div>
          <div class="r-flowrow r-flowrow--tot r-flowrow--pos">
            <span class="r-flowrow__lbl"><b>= Resultado neto del evento</b></span>
            <span class="r-flowrow__amt">{{ kpis().netoReal | money }}</span>
          </div>
        </div>
      </app-reporte-card>
    </app-reporte-section>
  `,
})
export class ReporteResultadoEconomicoSection {
  readonly kpis = input.required<ReporteKpis>();
}
