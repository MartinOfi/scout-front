import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Tarjeta KPI con barra de color superior, label uppercase y valor grande. */
@Component({
  selector: 'app-reporte-kpi-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="r-kpi" [style.--bar]="accent()">
      <div class="r-kpi__label">{{ label() }}</div>
      <div class="r-kpi__value">{{ value() }}</div>
      @if (sub()) {
        <div class="r-kpi__sub">{{ sub() }}</div>
      }
    </div>
  `,
})
export class ReporteKpiCardComponent {
  readonly label = input.required<string>();
  /** Valor ya formateado (moneda/porcentaje/número). */
  readonly value = input.required<string>();
  readonly sub = input<string | null>(null);
  readonly accent = input<string>('#60a5fa');
}
