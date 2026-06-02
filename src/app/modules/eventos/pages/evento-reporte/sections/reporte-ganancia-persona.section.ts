import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MoneyPipe } from '../../../../../shared/pipes/money.pipe';
import { ReporteGananciaPersona } from '../../../../../shared/models';
import { ReporteSectionComponent } from '../ui/reporte-section.component';
import { ReporteCardComponent } from '../ui/reporte-card.component';

/**
 * Sección de venta+cuentas_personales: payout de ganancia por persona.
 * STUB visual: el backend aún no completa `gananciaPorPersona`.
 */
@Component({
  selector: 'app-reporte-ganancia-persona-section',
  standalone: true,
  imports: [MoneyPipe, ReporteSectionComponent, ReporteCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-reporte-section title="Ganancia por persona">
      <app-reporte-card>
        @if (ganancias().length > 0) {
          <div class="r-scroll">
            <table class="r-table" style="min-width:360px">
              <thead>
                <tr>
                  <th>Persona</th>
                  <th class="num">Ganancia (cuenta personal)</th>
                </tr>
              </thead>
              <tbody>
                @for (g of ganancias(); track g.personaId) {
                  <tr>
                    <td>{{ g.nombre }}</td>
                    <td class="num">{{ g.ganancia | money }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <p class="r-muted" style="text-align:center;padding:1rem 0;font-size:13.5px">
            Bloque pendiente de implementar para eventos con destino “cuentas personales”.
          </p>
        }
      </app-reporte-card>
    </app-reporte-section>
  `,
})
export class ReporteGananciaPersonaSection {
  readonly ganancias = input.required<ReporteGananciaPersona[]>();
}
