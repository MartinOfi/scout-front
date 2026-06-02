import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ReporteNoteVariant = 'warn' | 'info' | 'pink';

/** Caja de nota/aviso del reporte (variantes warn/info/pink). */
@Component({
  selector: 'app-reporte-note',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="r-note" [class]="cls()"><ng-content /></p>`,
})
export class ReporteNoteComponent {
  readonly variant = input<ReporteNoteVariant>('warn');
  protected readonly cls = computed(() =>
    this.variant() === 'info'
      ? 'r-note--info'
      : this.variant() === 'pink'
        ? 'r-note--pink'
        : '',
  );
}
