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
          <div class="flex min-h-[70vh] items-center justify-center px-4 text-slate-500">
            <div
              class="w-full max-w-[26rem] rounded-2xl border border-slate-400/25 bg-slate-400/[0.06] p-8 text-center shadow-sm sm:p-10"
            >
              <div
                class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-400/15"
              >
                <mat-icon class="!h-8 !w-8 text-[2rem] leading-none">lock</mat-icon>
              </div>
              <h2 class="text-lg font-semibold text-slate-600">Reporte no disponible</h2>
              <p class="mx-auto mt-2 max-w-[22rem] text-sm leading-relaxed opacity-90">
                Este reporte todavía no es público. Pedile al grupo que lo active, o iniciá sesión
                si sos parte del equipo.
              </p>
              <a
                [routerLink]="['/login']"
                class="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-400/30 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-400/10"
              >
                <mat-icon class="!h-[18px] !w-[18px] text-[18px] leading-none">login</mat-icon>
                Iniciar sesión
              </a>
            </div>
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
