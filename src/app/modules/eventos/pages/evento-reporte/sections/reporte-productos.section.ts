import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { MoneyPipe } from '../../../../../shared/pipes/money.pipe';
import { DonutChartComponent } from '../../../../../shared/components/charts/donut-chart.component';
import { ReporteProducto } from '../../../../../shared/models';
import { ReporteSectionComponent } from '../ui/reporte-section.component';
import { ReporteCardComponent } from '../ui/reporte-card.component';
import { formatArs } from '../reporte-format';

@Component({
  selector: 'app-reporte-productos-section',
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
    <app-reporte-section title="Productos">
      <div class="r-grid r-grid--58">
        <app-reporte-card>
          <div class="r-scroll">
            <table class="r-table r-table--min">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="num">Costo</th>
                  <th class="num">Venta</th>
                  <th class="num">Unid.</th>
                  <th class="num">Recaudado</th>
                  <th class="num">%</th>
                </tr>
              </thead>
              <tbody>
                @for (p of productos(); track p.nombre) {
                  <tr>
                    <td>{{ p.nombre }}</td>
                    <td class="num">{{ p.precioCosto | money }}</td>
                    <td class="num">{{ p.precioVenta | money }}</td>
                    <td class="num">{{ p.unidades }}</td>
                    <td class="num">{{ p.recaudado | money }}</td>
                    <td class="num">{{ p.porcentaje | percent: '1.0-1' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-reporte-card>
        <app-reporte-card>
          <app-donut-chart [labels]="labels()" [values]="values()" [valueFormatter]="formatArs" />
        </app-reporte-card>
      </div>
    </app-reporte-section>
  `,
})
export class ReporteProductosSection {
  readonly productos = input.required<ReporteProducto[]>();
  protected readonly formatArs = formatArs;

  protected labels(): string[] {
    return this.productos().map((p) => p.nombre);
  }

  protected values(): number[] {
    return this.productos().map((p) => p.recaudado);
  }
}
