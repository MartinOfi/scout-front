/**
 * Movimientos Table Component
 * Dumb Component - max 100 líneas
 * Tabla de movimientos sin lógica de negocio
 * SIN any - tipado estricto
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { Movimiento } from '../../../../../../shared/models';
import { TipoMovimientoEnum, ConceptoMovimiento, CONCEPTO_MOVIMIENTO_LABELS } from '../../../../../../shared/enums';

@Component({
  selector: 'app-movimientos-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './movimientos-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovimientosTableComponent {
  readonly movimientos = input.required<Movimiento[]>();
  readonly verDetalle = output<string>();

  readonly displayedColumns: string[] = ['fecha', 'concepto', 'tipo', 'monto', 'acciones'];
  readonly tipoEnum = TipoMovimientoEnum;
  readonly conceptoLabels = CONCEPTO_MOVIMIENTO_LABELS;

  getConceptoLabel(concepto: ConceptoMovimiento | string): string {
    if (concepto in this.conceptoLabels) {
      return this.conceptoLabels[concepto as ConceptoMovimiento];
    }
    return concepto;
  }
}
