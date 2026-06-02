import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { EventosApiService } from '../../services/eventos-api.service';
import { ReporteEvento } from '../../../../shared/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { sectionsFor } from './reporte-secciones.config';

type ReporteState =
  | { status: 'loading' }
  | { status: 'ok'; reporte: ReporteEvento }
  | { status: 'error' };

@Component({
  selector: 'app-evento-reporte',
  standalone: true,
  imports: [NgComponentOutlet, RouterLink, MatIconModule, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './reporte-theme.scss',
  template: `
    <div class="w-full px-2 py-2 sm:px-4">
      <a
        [routerLink]="['/eventos', id()]"
        class="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <mat-icon class="text-base">arrow_back</mat-icon> Volver al evento
      </a>

      @switch (state().status) {
        @case ('loading') {
          <app-loading-spinner />
        }
        @case ('error') {
          <div
            class="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-6 text-center text-sm text-rose-500"
          >
            No se pudo cargar el reporte del evento.
          </div>
        }
        @case ('ok') {
          <div class="reporte-scope">
            @for (section of sections(); track section.key) {
              <ng-container
                *ngComponentOutlet="section.component; inputs: section.inputs(reporte()!)"
              />
            }
          </div>
        }
      }
    </div>
  `,
})
export class EventoReporteComponent {
  private readonly api = inject(EventosApiService);

  readonly id = input.required<string>();

  protected readonly state = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) =>
        this.api.getReporte(id).pipe(
          map((reporte): ReporteState => ({ status: 'ok', reporte })),
          startWith<ReporteState>({ status: 'loading' }),
          catchError(() => of<ReporteState>({ status: 'error' })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as ReporteState },
  );

  protected readonly reporte = computed<ReporteEvento | null>(() => {
    const s = this.state();
    return s.status === 'ok' ? s.reporte : null;
  });

  protected readonly sections = computed(() => {
    const r = this.reporte();
    return r ? sectionsFor(r) : [];
  });
}
