import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReporteStock } from '../../../../../shared/models';
import { ReporteSectionComponent } from '../ui/reporte-section.component';
import { ReporteCardComponent } from '../ui/reporte-card.component';
import { ReporteNoteComponent } from '../ui/reporte-note.component';
import { formatPct } from '../reporte-format';

@Component({
  selector: 'app-reporte-stock-entrega-section',
  standalone: true,
  imports: [ReporteSectionComponent, ReporteCardComponent, ReporteNoteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-reporte-section
      title="Vendido vs. entregado"
      subtitle="stock pendiente de retiro"
    >
      <app-reporte-card>
        <div class="r-scroll">
          <table class="r-table r-table--min">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="num">Vendido</th>
                <th class="num">Entregado</th>
                <th class="num">Pendiente</th>
              </tr>
            </thead>
            <tbody>
              @for (p of stock().productos; track p.nombre) {
                <tr>
                  <td>{{ p.nombre }}</td>
                  <td class="num">{{ p.vendido }}</td>
                  <td class="num">{{ p.entregado }}</td>
                  <td class="num">{{ p.pendiente }}</td>
                </tr>
              }
              <tr style="font-weight:700">
                <td>TOTAL</td>
                <td class="num">{{ stock().totalVendido }}</td>
                <td class="num">{{ stock().totalEntregado }}</td>
                <td class="num">{{ stock().totalPendiente }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        @if (stock().totalPendiente > 0) {
          <app-reporte-note variant="info">
            Quedan <b>{{ stock().totalPendiente }}</b> unidades vendidas sin retirar
            ({{ pendientePct() }} del total).
          </app-reporte-note>
        }
      </app-reporte-card>
    </app-reporte-section>
  `,
})
export class ReporteStockEntregaSection {
  readonly stock = input.required<ReporteStock>();

  protected pendientePct(): string {
    const s = this.stock();
    return s.totalVendido > 0 ? formatPct(s.totalPendiente / s.totalVendido) : '0%';
  }
}
