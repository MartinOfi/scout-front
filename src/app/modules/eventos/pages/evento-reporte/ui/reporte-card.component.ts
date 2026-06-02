import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Panel/card del reporte (bg panel, borde line, radius 14). */
@Component({
  selector: 'app-reporte-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="r-card"><ng-content /></div>`,
})
export class ReporteCardComponent {}
