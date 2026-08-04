/**
 * Inscripcion Detail Component
 * Logbook-inspired detail page showing payment journey
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  Signal,
  computed,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { take, switchMap, from } from 'rxjs';

import { InscripcionesStateService } from '../../services/inscripciones-state.service';
import { CajasApiService } from '../../../cajas/services/cajas-api.service';
import { ConfirmDialogService } from '../../../../shared/services';
import { LoadingSpinnerComponent, EmptyStateComponent } from '../../../../shared';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { MoneyPipe } from '../../../../shared/pipes';
import {
  InscripcionConEstado,
  MovimientoInscripcion,
  PagoInscripcionDto,
  UpdatePagoDto,
  ExistingPago,
} from '../../../../shared/models';
import {
  TIPO_INSCRIPCION_LABELS,
  ESTADO_INSCRIPCION_LABELS,
  EstadoInscripcion,
  MedioPago,
  ConceptoMovimiento,
  CONCEPTO_MOVIMIENTO_LABELS,
} from '../../../../shared/enums';

/** Conceptos que representan un pago real editable desde este timeline */
const CONCEPTOS_PAGO_EDITABLE: ReadonlySet<ConceptoMovimiento> = new Set([
  ConceptoMovimiento.INSCRIPCION_SCOUT_ARGENTINA,
  ConceptoMovimiento.INSCRIPCION_GRUPO,
]);
import type {
  PagoInscripcionDialogData,
  PagoInscripcionDialogResult,
} from '../shared/pago-inscripcion-dialog/pago-inscripcion-dialog.component';
import type {
  BonificarInscripcionDialogData,
  BonificarInscripcionDialogResult,
} from '../shared/bonificar-inscripcion-dialog/bonificar-inscripcion-dialog.component';

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
    MoneyPipe,
    DatePipe,
    MatIconModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ButtonComponent,
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
  private readonly cdr = inject(ChangeDetectorRef);

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
      d.autorizacionIngreso &&
      d.certificadoAptitudFisica
    );
  });

  /** Count of pending authorizations */
  readonly authPendingCount: Signal<number> = computed(() => {
    const d = this.detail();
    if (!d) return 5;
    let count = 0;
    if (!d.declaracionDeSalud) count++;
    if (!d.autorizacionDeImagen) count++;
    if (!d.salidasCercanas) count++;
    if (!d.autorizacionIngreso) count++;
    if (!d.certificadoAptitudFisica) count++;
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

  /** Get human-readable label for a movement's concept */
  conceptoLabel(concepto: ConceptoMovimiento): string {
    return CONCEPTO_MOVIMIENTO_LABELS[concepto] ?? concepto;
  }

  /**
   * Solo los ingresos reales de la inscripción (efectivo/transferencia/saldo
   * personal como pago) son editables desde este timeline. Bonificación y
   * uso de saldo personal son las patas internas de un movimiento linkeado
   * y se ajustan por su propio flujo, no por edición directa.
   */
  esPagoEditable(mov: MovimientoInscripcion): boolean {
    return mov.tipo === 'ingreso' && CONCEPTOS_PAGO_EDITABLE.has(mov.concepto);
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

  /** Otorgar o ajustar la bonificación de esta inscripción (fondo solidario) */
  onBonificar(): void {
    const d = this.detail();
    if (!d) return;

    const dialogData: BonificarInscripcionDialogData = {
      inscripcionId: d.id,
      personaNombre: d.persona?.nombre ?? 'Sin nombre',
      montoTotal: d.montoTotal,
      montoBonificadoActual: d.montoBonificado,
    };

    this.openBonificarDialog(dialogData)
      .pipe(switchMap((dialogRef) => dialogRef.afterClosed()))
      .subscribe((result: BonificarInscripcionDialogResult | undefined) => {
        if (!result) return;
        this.state.bonificar(d.id, result.monto).subscribe();
      });
  }

  /** Quitar la bonificación de esta inscripción */
  onQuitarBonificacion(): void {
    const d = this.detail();
    if (!d) return;
    this.state.quitarBonificacion(d.id).subscribe();
  }

  onRegisterPayment(): void {
    const d = this.detail();
    if (!d || d.saldoPendiente <= 0) return;

    // Fetch saldo de cuenta personal before opening dialog
    this.cajasApi
      .getSaldoCuentaPersonal(d.personaId)
      .pipe(
        switchMap((saldoCuentaPersonal: number) => {
          const dialogData: PagoInscripcionDialogData = {
            inscripcionId: d.id,
            montoPendiente: d.saldoPendiente,
            saldoCuentaPersonal,
            mode: 'create',
          };

          return this.openPaymentDialog(dialogData);
        }),
        switchMap((dialogRef) => dialogRef.afterClosed()),
      )
      .subscribe((result: PagoInscripcionDialogResult | undefined) => {
        if (!result || !d) return;
        this.handleDialogResult(d.id, result);
      });
  }

  /** Edit an existing payment from the timeline */
  onEditPayment(mov: MovimientoInscripcion): void {
    const d = this.detail();
    if (!d) return;

    const existingPago: ExistingPago = {
      movimientoId: mov.id,
      monto: mov.monto,
      medioPago: mov.medioPago,
      descripcion: mov.descripcion,
      fecha: mov.fecha,
    };

    const dialogData: PagoInscripcionDialogData = {
      inscripcionId: d.id,
      montoPendiente: d.saldoPendiente,
      mode: 'edit',
      existingPago,
    };

    this.openPaymentDialog(dialogData)
      .pipe(switchMap((dialogRef) => dialogRef.afterClosed()))
      .subscribe((result: PagoInscripcionDialogResult | undefined) => {
        if (!result) return;
        this.handleDialogResult(d.id, result);
      });
  }

  /** Open payment dialog with dynamic import */
  private openPaymentDialog(dialogData: PagoInscripcionDialogData) {
    return from(
      import('../shared/pago-inscripcion-dialog/pago-inscripcion-dialog.component').then(
        ({ PagoInscripcionDialogComponent }) => {
          const dialogRef = this.dialog.open(PagoInscripcionDialogComponent, {
            width: '720px',
            maxWidth: '95vw',
            data: dialogData,
            disableClose: false,
          });
          return dialogRef;
        },
      ),
    );
  }

  /** Open bonificar dialog with dynamic import */
  private openBonificarDialog(dialogData: BonificarInscripcionDialogData) {
    return from(
      import('../shared/bonificar-inscripcion-dialog/bonificar-inscripcion-dialog.component').then(
        ({ BonificarInscripcionDialogComponent }) => {
          return this.dialog.open(BonificarInscripcionDialogComponent, {
            width: '480px',
            maxWidth: '90vw',
            data: dialogData,
            disableClose: false,
          });
        },
      ),
    );
  }

  /** Handle dialog result based on mode */
  private handleDialogResult(inscripcionId: string, result: PagoInscripcionDialogResult): void {
    switch (result.mode) {
      case 'create': {
        const dto: PagoInscripcionDto = {
          montoPagado: result.data.montoPagado,
          montoConSaldoPersonal: result.data.montoConSaldoPersonal,
          medioPago: result.data.medioPago,
          descripcion: result.data.descripcion,
        };
        this.state.pagarInscripcion(inscripcionId, dto).subscribe({
          next: () => this.reloadDetail(inscripcionId),
        });
        break;
      }
      case 'edit': {
        const updateDto: UpdatePagoDto = {
          monto: result.data.monto,
          medioPago: result.data.medioPago,
          descripcion: result.data.descripcion,
        };
        this.state.updatePago(inscripcionId, result.movimientoId, updateDto).subscribe({
          next: () => this.reloadDetail(inscripcionId),
        });
        break;
      }
      case 'delete': {
        this.state.deletePago(inscripcionId, result.movimientoId).subscribe({
          next: () => this.reloadDetail(inscripcionId),
        });
        break;
      }
    }
  }

  /** Reload inscription detail after payment operations */
  private reloadDetail(inscripcionId: string): void {
    this.state.loadDetail(inscripcionId);
    this.cdr.markForCheck();
  }
}
