import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MoneyPipe } from '../../../../../shared/pipes/money.pipe';
import { ReporteEgreso } from '../../../../../shared/models';
import { ReporteSectionComponent } from '../ui/reporte-section.component';
import { ReporteCardComponent } from '../ui/reporte-card.component';
import { formatArs } from '../reporte-format';

@Component({
  selector: 'app-reporte-egresos-section',
  standalone: true,
  imports: [MoneyPipe, ReporteSectionComponent, ReporteCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-reporte-section title="Egresos del evento" [subtitle]="totalLabel()">
      <app-reporte-card>
        <div class="r-scroll">
          <table class="r-table r-table--min">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Responsable</th>
                <th>Medio</th>
                <th class="num">Monto</th>
              </tr>
            </thead>
            <tbody>
              @for (e of egresos(); track $index) {
                <tr>
                  <td>{{ e.descripcion }}</td>
                  <td>{{ e.responsableNombre ?? '—' }}</td>
                  <td><span class="r-chip">{{ e.medioPago }}</span></td>
                  <td class="num">{{ e.monto | money }}</td>
                </tr>
              }
              <tr style="font-weight:700">
                <td colspan="3">TOTAL EGRESOS</td>
                <td class="num">{{ total() | money }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </app-reporte-card>
    </app-reporte-section>
  `,
})
export class ReporteEgresosSection {
  readonly egresos = input.required<ReporteEgreso[]>();

  protected total(): number {
    return this.egresos().reduce((s, e) => s + e.monto, 0);
  }

  protected totalLabel(): string {
    return formatArs(this.total());
  }
}
