/**
 * MovimientoCard Component
 * Dumb component compartido (campamentos y eventos) — muestra una fila de
 * movimiento con su estado de pago.
 *  - Click en el badge "pendiente_reembolso" => emite `pagarReembolso`.
 *  - Si `deletable`, muestra botón de borrar => emite `eliminar`.
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  EstadoPago,
  ESTADO_PAGO_LABELS,
  MEDIO_PAGO_LABELS,
  MedioPago,
} from '../../enums';
import { MoneyPipe } from '../../pipes';

/**
 * Forma mínima que necesita la card. Tanto `Movimiento` (eventos) como
 * `MovimientoCampamentoDto` (campamentos) la satisfacen estructuralmente.
 */
export interface MovimientoCardVM {
  id: string;
  tipo: string; // 'ingreso' | 'egreso'
  descripcion?: string | null;
  responsableNombre: string;
  monto: number;
  medioPago: MedioPago;
  estadoPago: EstadoPago;
  fecha: Date | string;
}

@Component({
  selector: 'app-movimiento-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MoneyPipe,
    DatePipe,
  ],
  templateUrl: './movimiento-card.component.html',
  styleUrl: './movimiento-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovimientoCardComponent {
  @Input({ required: true }) movimiento!: MovimientoCardVM;

  /** Si true, muestra el botón de eliminar y habilita el output `eliminar`. */
  @Input() deletable = false;

  /** Si true, el movimiento se está borrando (spinner + disabled). */
  @Input() deleting = false;

  @Output() pagarReembolso = new EventEmitter<MovimientoCardVM>();
  @Output() eliminar = new EventEmitter<string>();

  readonly EstadoPago = EstadoPago;

  get estadoLabel(): string {
    return (
      ESTADO_PAGO_LABELS[this.movimiento.estadoPago] ?? this.movimiento.estadoPago
    );
  }

  get medioPagoLabel(): string {
    return (
      MEDIO_PAGO_LABELS[this.movimiento.medioPago] ?? this.movimiento.medioPago
    );
  }

  get isPendienteReembolso(): boolean {
    return this.movimiento.estadoPago === EstadoPago.PENDIENTE_REEMBOLSO;
  }

  onEstadoClick(): void {
    if (this.isPendienteReembolso) {
      this.pagarReembolso.emit(this.movimiento);
    }
  }

  onEliminar(): void {
    if (!this.deleting) {
      this.eliminar.emit(this.movimiento.id);
    }
  }
}
