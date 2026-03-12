/**
 * Movimiento Info Card Component (Dumb)
 * Max 80 líneas - SIN any
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { Movimiento } from '../../../../../shared/models';
import {
  CONCEPTO_MOVIMIENTO_LABELS,
  MEDIO_PAGO_LABELS,
  ESTADO_PAGO_LABELS,
} from '../../../../../shared/enums';
import { HumanizePipe } from '../../../../../shared/pipes';

@Component({
  selector: 'app-movimiento-info-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatDividerModule,
    HumanizePipe,
  ],
  templateUrl: './movimiento-info-card.component.html',
  styleUrl: './movimiento-info-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovimientoInfoCardComponent {
  @Input({ required: true }) movimiento!: Movimiento;

  readonly conceptoLabels = CONCEPTO_MOVIMIENTO_LABELS;
  readonly medioPagoLabels = MEDIO_PAGO_LABELS;
  readonly estadoPagoLabels = ESTADO_PAGO_LABELS;

  get tipoColor(): string {
    return this.movimiento.tipo === 'ingreso' ? 'primary' : 'warn';
  }

  get tipoIcon(): string {
    return this.movimiento.tipo === 'ingreso' ? 'trending_up' : 'trending_down';
  }

  get estadoPagoColor(): string {
    return this.movimiento.estadoPago === 'pagado' ? 'primary' : 'accent';
  }
}
