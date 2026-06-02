import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { MoneyPipe } from '../../../../../shared/pipes/money.pipe';
import { ReporteVendedor } from '../../../../../shared/models';
import { PersonaType } from '../../../../../shared/enums/persona.enum';
import { ReporteSectionComponent } from '../ui/reporte-section.component';
import { ReporteCardComponent } from '../ui/reporte-card.component';

@Component({
  selector: 'app-reporte-detalle-vendedor-section',
  standalone: true,
  imports: [PercentPipe, MoneyPipe, ReporteSectionComponent, ReporteCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-reporte-section title="Detalle por vendedor">
      <app-reporte-card>
        <div class="r-scroll" style="max-height:520px;overflow-y:auto">
          <table class="r-table" style="min-width:560px">
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Tipo</th>
                <th>Rama</th>
                <th class="num">Unid.</th>
                <th class="num">Recaudado</th>
                <th class="num">%</th>
                <th class="num">Entreg.</th>
                <th class="num">Pend.</th>
              </tr>
            </thead>
            <tbody>
              @for (v of vendedores(); track v.vendedorId) {
                <tr>
                  <td>{{ v.nombre }}</td>
                  <td><span class="r-chip">{{ esEducador(v) ? 'Educ.' : 'Prot.' }}</span></td>
                  <td>{{ v.rama ?? '—' }}</td>
                  <td class="num">{{ v.unidades }}</td>
                  <td class="num">{{ v.recaudado | money }}</td>
                  <td class="num">{{ v.porcentaje | percent: '1.0-1' }}</td>
                  <td class="num">{{ v.entregado }}</td>
                  <td class="num" [style.color]="v.pendiente < 0 ? '#fb7185' : null">
                    {{ v.pendiente }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-reporte-card>
    </app-reporte-section>
  `,
})
export class ReporteDetalleVendedorSection {
  readonly vendedores = input.required<ReporteVendedor[]>();

  protected esEducador(v: ReporteVendedor): boolean {
    return v.tipo === PersonaType.EDUCADOR;
  }
}
