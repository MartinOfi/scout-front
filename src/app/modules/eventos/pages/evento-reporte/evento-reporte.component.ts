import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { EventosApiService } from '../../services/eventos-api.service';
import { TokenService } from '../../../auth/services/token.service';
import { ReporteEvento } from '../../../../shared/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { sectionsFor } from './reporte-secciones.config';

type ReporteState =
  | { status: 'loading' }
  | { status: 'ok'; reporte: ReporteEvento }
  | { status: 'no-disponible' }
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
      @if (conSesion) {
        <a
          [routerLink]="['/eventos', id()]"
          class="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <mat-icon class="text-base">arrow_back</mat-icon> Volver al evento
        </a>
      }

      @switch (state().status) {
        @case ('loading') {
          <app-loading-spinner />
        }
        @case ('no-disponible') {
          <div
            class="mx-auto max-w-md rounded-xl border border-slate-400/30 bg-slate-400/10 px-4 py-10 text-center text-sm text-slate-500"
          >
            <mat-icon class="mb-2 text-3xl opacity-60">lock</mat-icon>
            <p class="font-medium">Este reporte no está disponible públicamente.</p>
            <p class="mt-1 opacity-80">
              Pedile al grupo que active el reporte público, o iniciá sesión si sos parte del
              equipo.
            </p>
          </div>
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
  private readonly tokenService = inject(TokenService);

  readonly id = input.required<string>();

  /**
   * Hay sesión (tokens presentes) → usamos el endpoint autenticado, que ve el
   * reporte siempre. Sin sesión → endpoint público, gated por el flag del
   * evento. Lo evaluamos de forma sincrónica con los tokens (no con el perfil
   * async) para no pegarle al endpoint equivocado en el primer render.
   */
  protected readonly conSesion = this.tokenService.hasTokens();

  protected readonly state = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => {
        const fuente$ = this.conSesion ? this.api.getReporte(id) : this.api.getReportePublico(id);
        return fuente$.pipe(
          map((reporte): ReporteState => ({ status: 'ok', reporte })),
          startWith<ReporteState>({ status: 'loading' }),
          catchError((err: HttpErrorResponse) =>
            of<ReporteState>(
              !this.conSesion && err.status === 404
                ? { status: 'no-disponible' }
                : { status: 'error' },
            ),
          ),
        );
      }),
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
