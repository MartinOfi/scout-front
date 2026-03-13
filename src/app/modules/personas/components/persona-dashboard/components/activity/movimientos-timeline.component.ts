/**
 * Movimientos Timeline Component
 * Displays recent movements in a timeline format
 * Uses timeline-item pattern from inscripcion-detail
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { MovimientoDashboard } from '../../../../models';
import {
  ConceptoMovimiento,
  MedioPago,
  CONCEPTO_MOVIMIENTO_LABELS,
  MEDIO_PAGO_LABELS,
} from '../../../../../../shared/enums';

@Component({
  selector: 'app-movimientos-timeline',
  standalone: true,
  imports: [CommonModule, MatIconModule, CurrencyPipe, DatePipe],
  templateUrl: './movimientos-timeline.component.html',
  styleUrl: './movimientos-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovimientosTimelineComponent {
  readonly movimientos = input.required<MovimientoDashboard[]>();

  readonly verTodos = output<void>();

  readonly conceptoLabels = CONCEPTO_MOVIMIENTO_LABELS;
  readonly medioPagoLabels = MEDIO_PAGO_LABELS;

  /**
   * Get appropriate icon for concepto type
   */
  getConceptoIcon(concepto: ConceptoMovimiento): string {
    const iconMap: Partial<Record<ConceptoMovimiento, string>> = {
      [ConceptoMovimiento.INSCRIPCION_GRUPO]: 'how_to_reg',
      [ConceptoMovimiento.INSCRIPCION_SCOUT_ARGENTINA]: 'how_to_reg',
      [ConceptoMovimiento.INSCRIPCION_PAGO_SCOUT_ARGENTINA]: 'payments',
      [ConceptoMovimiento.CUOTA_GRUPO]: 'calendar_month',
      [ConceptoMovimiento.CAMPAMENTO_PAGO]: 'camping',
      [ConceptoMovimiento.CAMPAMENTO_GASTO]: 'camping',
      [ConceptoMovimiento.EVENTO_VENTA_INGRESO]: 'storefront',
      [ConceptoMovimiento.EVENTO_VENTA_GASTO]: 'storefront',
      [ConceptoMovimiento.EVENTO_GRUPO_INGRESO]: 'event',
      [ConceptoMovimiento.EVENTO_GRUPO_GASTO]: 'event',
      [ConceptoMovimiento.GASTO_GENERAL]: 'receipt',
      [ConceptoMovimiento.REEMBOLSO]: 'sync_alt',
      [ConceptoMovimiento.AJUSTE_INICIAL]: 'tune',
      [ConceptoMovimiento.ASIGNACION_FONDO_RAMA]: 'account_balance',
      [ConceptoMovimiento.TRANSFERENCIA_BAJA]: 'person_off',
    };
    return iconMap[concepto] ?? 'payments';
  }
}
