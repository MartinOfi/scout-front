import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReporteKpiCardComponent } from '../ui/reporte-kpi-card.component';
import { ReporteSectionComponent } from '../ui/reporte-section.component';
import { ReporteKpiItem } from './reporte-kpi-item';

@Component({
  selector: 'app-reporte-kpis-section',
  standalone: true,
  imports: [ReporteKpiCardComponent, ReporteSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-reporte-section title="Indicadores clave">
      <div class="r-grid r-grid--kpis">
        @for (item of items(); track item.label) {
          <app-reporte-kpi-card
            [label]="item.label"
            [value]="item.value"
            [sub]="item.sub ?? null"
            [accent]="item.accent"
          />
        }
      </div>
    </app-reporte-section>
  `,
})
export class ReporteKpisSection {
  readonly items = input.required<ReporteKpiItem[]>();
}
