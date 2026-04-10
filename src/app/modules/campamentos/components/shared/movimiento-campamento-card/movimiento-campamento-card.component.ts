/**
 * MovimientoCampamentoCard Component
 * Dumb component — displays a single camp movement row.
 * Emits pagarReembolso when the "pendiente_reembolso" badge is clicked.
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { MovimientoCampamentoDto } from '../../../../../shared/models';
import { EstadoPago, ESTADO_PAGO_LABELS, MEDIO_PAGO_LABELS } from '../../../../../shared/enums';
import { MoneyPipe } from '../../../../../shared/pipes';

@Component({
  selector: 'app-movimiento-campamento-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MoneyPipe, DatePipe],
  templateUrl: './movimiento-campamento-card.component.html',
  styleUrl: './movimiento-campamento-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovimientoCampamentoCardComponent {
  @Input({ required: true }) movimiento!: MovimientoCampamentoDto;

  @Output() pagarReembolso = new EventEmitter<MovimientoCampamentoDto>();

  readonly EstadoPago = EstadoPago;

  get estadoLabel(): string {
    return ESTADO_PAGO_LABELS[this.movimiento.estadoPago] ?? this.movimiento.estadoPago;
  }

  get medioPagoLabel(): string {
    return MEDIO_PAGO_LABELS[this.movimiento.medioPago] ?? this.movimiento.medioPago;
  }

  get isPendienteReembolso(): boolean {
    return this.movimiento.estadoPago === EstadoPago.PENDIENTE_REEMBOLSO;
  }

  onEstadoClick(): void {
    if (this.isPendienteReembolso) {
      this.pagarReembolso.emit(this.movimiento);
    }
  }
}
