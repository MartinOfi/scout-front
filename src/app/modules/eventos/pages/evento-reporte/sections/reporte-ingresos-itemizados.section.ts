import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MoneyPipe } from '../../../../../shared/pipes/money.pipe';
import { ReporteIngresoItem } from '../../../../../shared/models';
import { ReporteSectionComponent } from '../ui/reporte-section.component';
import { ReporteCardComponent } from '../ui/reporte-card.component';

/** Sección de eventos GRUPO: ingresos manuales itemizados. */
@Component({
  selector: 'app-reporte-ingresos-itemizados-section',
  standalone: true,
  imports: [DatePipe, MoneyPipe, ReporteSectionComponent, ReporteCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-reporte-section title="Ingresos del evento">
      <app-reporte-card>
        @if (ingresos().length > 0) {
          <div class="r-scroll">
            <table class="r-table r-table--min">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Responsable</th>
                  <th>Fecha</th>
                  <th class="num">Monto</th>
                </tr>
              </thead>
              <tbody>
                @for (i of ingresos(); track $index) {
                  <tr>
                    <td>{{ i.descripcion }}</td>
                    <td>{{ i.responsableNombre ?? '—' }}</td>
                    <td>{{ i.fecha | date: 'shortDate' }}</td>
                    <td class="num">{{ i.monto | money }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <p class="r-muted" style="text-align:center;padding:1rem 0;font-size:13.5px">
            Este evento de grupo no tiene ingresos registrados.
          </p>
        }
      </app-reporte-card>
    </app-reporte-section>
  `,
})
export class ReporteIngresosItemizadosSection {
  readonly ingresos = input.required<ReporteIngresoItem[]>();
}
