/**
 * Inscripcion Detail Component
 * Logbook-inspired detail page showing payment journey
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  Signal,
  computed,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { take, switchMap, from } from 'rxjs';

import { InscripcionesStateService } from '../../services/inscripciones-state.service';
import { CajasApiService } from '../../../cajas/services/cajas-api.service';
import { ConfirmDialogService } from '../../../../shared/services';
import {
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '../../../../shared';
import { InscripcionConEstado, PagoInscripcionDto } from '../../../../shared/models';
import {
  TIPO_INSCRIPCION_LABELS,
  ESTADO_INSCRIPCION_LABELS,
  EstadoInscripcion,
} from '../../../../shared/enums';
import type {
  PagoInscripcionDialogData,
  PagoInscripcionFormData,
} from '../shared/pago-inscripcion-dialog/pago-inscripcion-dialog.component';

/** Mapping for payment method labels */
const MEDIO_PAGO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  saldo_personal: 'Saldo Personal',
  debito: 'Débito',
  credito: 'Crédito',
  otro: 'Otro',
};

@Component({
  selector: 'app-inscripcion-detail',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatIconModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './inscripcion-detail.component.html',
  styleUrl: './inscripcion-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InscripcionDetailComponent implements OnInit {
  private readonly state = inject(InscripcionesStateService);
  private readonly cajasApi = inject(CajasApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);

  readonly loading: Signal<boolean> = this.state.loading;
  readonly error: Signal<string | null> = this.state.error;
  readonly detail: Signal<InscripcionConEstado | null> = this.state.selectedDetail;

  readonly tipoLabels = TIPO_INSCRIPCION_LABELS;
  readonly estadoLabels = ESTADO_INSCRIPCION_LABELS;

  /** Show authorization section only for scout_argentina inscriptions */
  readonly showAuthorizations: Signal<boolean> = computed(() => {
    const d = this.detail();
    return d?.tipo === 'scout_argentina';
  });

  /** Calculate amount to pay (after bonificación) */
  readonly montoAPagar: Signal<number> = computed(() => {
    const d = this.detail();
    if (!d) return 0;
    return d.montoTotal - d.montoBonificado;
  });

  /** Payment progress percentage */
  readonly progressPercent: Signal<number> = computed(() => {
    const d = this.detail();
    if (!d) return 0;
    const total = this.montoAPagar();
    if (total <= 0) return 100;
    return Math.min(100, Math.round((d.montoPagado / total) * 100));
  });

  /** CSS class for progress bar based on state */
  readonly progressClass: Signal<string> = computed(() => {
    const d = this.detail();
    if (!d) return 'payment-progress__fill--pending';
    if (d.saldoPendiente === 0) return 'payment-progress__fill--success';
    if (d.montoPagado > 0) return 'payment-progress__fill--partial';
    return 'payment-progress__fill--pending';
  });

  /** Icon for estado badge */
  readonly estadoIcon: Signal<string> = computed(() => {
    const d = this.detail();
    if (!d) return 'schedule';
    switch (d.estado) {
      case 'pagado':
        return 'check_circle';
      case 'parcial':
        return 'timelapse';
      case 'bonificado':
        return 'card_giftcard';
      case 'pendiente':
      default:
        return 'schedule';
    }
  });

  /** Check if all authorizations are complete */
  readonly authComplete: Signal<boolean> = computed(() => {
    const d = this.detail();
    if (!d) return false;
    return (
      d.declaracionDeSalud &&
      d.autorizacionDeImagen &&
      d.salidasCercanas &&
      d.autorizacionIngreso
    );
  });

  /** Count of pending authorizations */
  readonly authPendingCount: Signal<number> = computed(() => {
    const d = this.detail();
    if (!d) return 4;
    let count = 0;
    if (!d.declaracionDeSalud) count++;
    if (!d.autorizacionDeImagen) count++;
    if (!d.salidasCercanas) count++;
    if (!d.autorizacionIngreso) count++;
    return count;
  });

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.state.select(id);
      }
    });
  }

  /** Get human-readable label for payment method */
  medioPagoLabel(medioPago: string): string {
    return MEDIO_PAGO_LABELS[medioPago] ?? medioPago;
  }

  onEdit(): void {
    const id = this.detail()?.id;
    if (id) {
      this.router.navigate(['/inscripciones', id, 'editar']);
    }
  }

  onDelete(): void {
    const id = this.detail()?.id;
    if (!id) return;
    this.confirmDialog.confirmDelete('inscripción').subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.state.delete(id).subscribe({
          next: () => this.router.navigate(['/inscripciones']),
        });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/inscripciones']);
  }

  onRegisterPayment(): void {
    const d = this.detail();
    if (!d || d.saldoPendiente <= 0) return;

    // Fetch saldo de cuenta personal before opening dialog
    this.cajasApi.getSaldoCuentaPersonal(d.personaId).pipe(
      switchMap((saldoCuentaPersonal: number) => {
        const dialogData: PagoInscripcionDialogData = {
          inscripcionId: d.id,
          montoPendiente: d.saldoPendiente,
          saldoCuentaPersonal,
        };

        // Dynamically import the dialog component and open it
        return from(
          import('../shared/pago-inscripcion-dialog/pago-inscripcion-dialog.component').then(
            ({ PagoInscripcionDialogComponent }) => {
              const dialogRef = this.dialog.open(PagoInscripcionDialogComponent, {
                width: '500px',
                maxWidth: '90vw',
                data: dialogData,
                disableClose: false,
              });
              return dialogRef;
            }
          )
        );
      }),
      switchMap((dialogRef) => dialogRef.afterClosed())
    ).subscribe((result: PagoInscripcionFormData | undefined) => {
      if (result) {
        const dto: PagoInscripcionDto = {
          montoPagado: result.montoPagado,
          montoConSaldoPersonal: result.montoConSaldoPersonal,
          medioPago: result.medioPago,
          descripcion: result.descripcion,
        };
        this.state.pagarInscripcion(d.id, dto).subscribe();
      }
    });
  }
}
