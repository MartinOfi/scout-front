import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { MoneyPipe } from '../../../../../shared/pipes/money.pipe';
import { ReporteVendedor } from '../../../../../shared/models';
import { PersonaType } from '../../../../../shared/enums/persona.enum';
import {
  CHART_COLOR_EDUCADOR,
  CHART_COLOR_PROTAGONISTA,
} from '../../../../../shared/components/charts/chart-palette';
import { ReporteSectionComponent } from '../ui/reporte-section.component';
import { ReporteCardComponent } from '../ui/reporte-card.component';

interface RankRow extends ReporteVendedor {
  readonly width: number;
  readonly color: string;
  readonly tag: string;
}

@Component({
  selector: 'app-reporte-ranking-vendedores-section',
  standalone: true,
  imports: [PercentPipe, MoneyPipe, ReporteSectionComponent, ReporteCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-reporte-section title="Ranking de vendedores" [subtitle]="subtitle()">
      <app-reporte-card>
        <div class="r-rank-legend">
          <span><i [style.background]="educadorColor"></i>Educador (E)</span>
          <span><i [style.background]="protagonistaColor"></i>Protagonista (P)</span>
        </div>
        <div class="r-ranklist">
          @for (r of rows(); track r.vendedorId; let i = $index) {
            <div class="r-rank">
              <span class="r-rank__pos" [class.r-rank__pos--top]="i < 3">{{ i + 1 }}</span>
              <div class="r-rank__main">
                <div class="r-rank__top">
                  <span class="r-rank__name">
                    {{ r.nombre }}
                    <span class="r-rank__tag" [style.color]="r.color">{{ r.tag }}</span>
                  </span>
                  <span class="r-rank__val">
                    {{ r.recaudado | money }}
                    <span class="r-muted" style="font-weight:400;font-size:11.5px">
                      · {{ r.porcentaje | percent: '1.0-1' }}
                    </span>
                  </span>
                </div>
                <div class="r-rank__track">
                  <div class="r-rank__fill" [style.width.%]="r.width" [style.background]="r.color"></div>
                </div>
              </div>
            </div>
          }
        </div>
      </app-reporte-card>
    </app-reporte-section>
  `,
})
export class ReporteRankingVendedoresSection {
  readonly vendedores = input.required<ReporteVendedor[]>();
  protected readonly educadorColor = CHART_COLOR_EDUCADOR;
  protected readonly protagonistaColor = CHART_COLOR_PROTAGONISTA;

  protected subtitle(): string {
    return `${this.vendedores().length} en total`;
  }

  protected readonly rows = computed<RankRow[]>(() => {
    const list = [...this.vendedores()].sort((a, b) => b.recaudado - a.recaudado);
    const max = list.length > 0 ? list[0].recaudado : 0;
    return list.map((v) => {
      const educador = v.tipo === PersonaType.EDUCADOR;
      return {
        ...v,
        width: max > 0 ? (v.recaudado / max) * 100 : 0,
        color: educador ? CHART_COLOR_EDUCADOR : CHART_COLOR_PROTAGONISTA,
        tag: educador ? 'E' : 'P',
      };
    });
  });
}
