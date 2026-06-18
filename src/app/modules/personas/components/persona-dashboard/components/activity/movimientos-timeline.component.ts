/**
 * Movimientos Timeline Component
 * Displays recent movements using the shared data-list-card / data-list-item
 * components, which colorize ingresos (green) and egresos (red) automatically.
 */

import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MovimientoDashboard } from '../../../../models';
import {
  ConceptoMovimiento,
  TipoMovimientoEnum,
  CONCEPTO_MOVIMIENTO_LABELS,
  MEDIO_PAGO_LABELS,
} from '../../../../../../shared/enums';
import { DataListCardComponent } from '../../../../../../shared/components/data-list-card/data-list-card.component';
import { DataListItemComponent } from '../../../../../../shared/components/data-list-item/data-list-item.component';
import { IconVariant } from '../../../../../../shared/components/data-list/data-list.models';

interface MovimientoRow {
  readonly id: string;
  readonly icon: string;
  readonly iconVariant: IconVariant;
  readonly primaryText: string;
  readonly secondaryText: string;
  readonly signedMonto: number;
}

const CONCEPTO_ICONS: Partial<Record<ConceptoMovimiento, string>> = {
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
  [ConceptoMovimiento.TRANSFERENCIA_SALDO_PERSONAL]: 'swap_horiz',
};

@Component({
  selector: 'app-movimientos-timeline',
  standalone: true,
  imports: [DataListCardComponent, DataListItemComponent],
  templateUrl: './movimientos-timeline.component.html',
  styleUrl: './movimientos-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovimientosTimelineComponent {
  readonly movimientos = input.required<MovimientoDashboard[]>();

  readonly rows = computed<readonly MovimientoRow[]>(() =>
    this.movimientos().map((mov) => {
      const isIngreso = mov.tipo === TipoMovimientoEnum.INGRESO;
      const fecha = new DatePipe('es-AR').transform(mov.fecha, 'd MMM yyyy') ?? '';
      const medio = MEDIO_PAGO_LABELS[mov.medioPago];
      return {
        id: mov.id,
        icon: CONCEPTO_ICONS[mov.concepto] ?? 'payments',
        iconVariant: isIngreso ? 'success' : 'danger',
        primaryText: CONCEPTO_MOVIMIENTO_LABELS[mov.concepto] ?? String(mov.concepto),
        secondaryText: `${fecha} · ${medio}`,
        signedMonto: isIngreso ? mov.monto : -mov.monto,
      };
    }),
  );
}
