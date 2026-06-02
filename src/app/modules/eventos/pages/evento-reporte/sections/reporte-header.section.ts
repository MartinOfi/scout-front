import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReporteMeta } from '../../../../../shared/models';
import {
  TIPO_EVENTO_LABELS,
  DESTINO_GANANCIA_LABELS,
} from '../../../../../shared/enums';

@Component({
  selector: 'app-reporte-header-section',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="r-section r-section--tight">
      <p class="r-eyebrow">Reporte de evento · Grupo Scout</p>
      <h1 class="r-title">{{ evento().nombre }}</h1>
      <div class="r-badges">
        <span class="r-badge">📅 <b>{{ evento().fecha | date: 'longDate' }}</b></span>
        <span class="r-badge">Tipo: <b>{{ tipoLabel() }}</b></span>
        @if (destinoLabel()) {
          <span class="r-badge">Destino: <b>{{ destinoLabel() }}</b></span>
        }
        <span class="r-badge">
          Estado: <b>{{ evento().estaCerrado ? 'Cerrado' : 'Abierto' }}</b>
        </span>
      </div>
    </header>
  `,
})
export class ReporteHeaderSection {
  readonly evento = input.required<ReporteMeta>();

  protected tipoLabel(): string {
    return TIPO_EVENTO_LABELS[this.evento().tipo] ?? this.evento().tipo;
  }

  protected destinoLabel(): string | null {
    const destino = this.evento().destinoGanancia;
    return destino ? DESTINO_GANANCIA_LABELS[destino] : null;
  }
}
