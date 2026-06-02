import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReporteIntegridadFlag, ReporteSeveridad } from '../../../../../shared/models';
import { ReporteSectionComponent } from '../ui/reporte-section.component';
import { ReporteCardComponent } from '../ui/reporte-card.component';

const SEV_LABEL: Record<ReporteSeveridad, string> = {
  alta: 'ALERTA',
  media: 'ATENCIÓN',
  ok: 'OK',
};

@Component({
  selector: 'app-reporte-integridad-section',
  standalone: true,
  imports: [ReporteSectionComponent, ReporteCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-reporte-section title="Integridad de datos">
      <app-reporte-card>
        <div class="r-alerts">
          @for (flag of flags(); track $index) {
            <div class="r-alert">
              <span class="r-alert__tag" [class]="'r-alert__tag--' + flag.severidad">
                {{ label(flag.severidad) }}
              </span>
              <span class="r-alert__msg">{{ flag.mensaje }}</span>
            </div>
          }
        </div>
      </app-reporte-card>
    </app-reporte-section>
  `,
})
export class ReporteIntegridadSection {
  readonly flags = input.required<ReporteIntegridadFlag[]>();

  protected label(s: ReporteSeveridad): string {
    return SEV_LABEL[s];
  }
}
