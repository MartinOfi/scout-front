/**
 * Movimiento Row Component
 * Dumb Component - max 80 líneas
 * Fila de movimiento
 * SIN any - tipado estricto
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

import { Movimiento } from '../../../../../../shared/models';
import { 
  TipoMovimientoEnum, 
  CONCEPTO_MOVIMIENTO_LABELS,
  ESTADO_PAGO_LABELS 
} from '../../../../../../shared/enums';

@Component({
  selector: 'app-movimiento-row',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatChipsModule, MatMenuModule],
  templateUrl: './movimiento-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovimientoRowComponent {
  readonly movimiento = input.required<Movimiento>();

  readonly verDetalle = output<string>();
  readonly editar = output<string>();
  readonly eliminar = output<string>();

  readonly tipoEnum = TipoMovimientoEnum;
  readonly conceptoLabels = CONCEPTO_MOVIMIENTO_LABELS;
  readonly estadoLabels = ESTADO_PAGO_LABELS;
}
