import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Encabezado de sección del reporte (h2 con barra lateral de color) + contenido
 * proyectado. Replica los `<h2>` del reporte HTML. Estilado por el tema scoped
 * `.reporte-scope` (ver reporte-theme.scss).
 */
@Component({
  selector: 'app-reporte-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="r-section" [class.r-section--tight]="tight()">
      <h2 class="r-h2">
        {{ title() }}
        @if (subtitle()) {
          <span class="r-sub">· {{ subtitle() }}</span>
        }
      </h2>
      <ng-content />
    </section>
  `,
})
export class ReporteSectionComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly tight = input<boolean>(false);
}
