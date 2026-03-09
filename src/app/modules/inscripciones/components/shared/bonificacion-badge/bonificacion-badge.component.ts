/**
 * Estado Badge Component (Dumb)
 * Displays the payment state of an inscription
 * Max 40 líneas - SIN any
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { EstadoInscripcion, ESTADO_INSCRIPCION_LABELS } from '../../../../../shared/enums';

@Component({
  selector: 'app-bonificacion-badge',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './bonificacion-badge.component.html',
  styleUrl: './bonificacion-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BonificacionBadgeComponent {
  @Input({ required: true }) estado!: EstadoInscripcion;
  @Input() montoBonificado?: number;

  readonly estadoLabels = ESTADO_INSCRIPCION_LABELS;

  get colorChip(): 'primary' | 'accent' | 'warn' {
    switch (this.estado) {
      case 'pagado':
        return 'primary';
      case 'parcial':
        return 'accent';
      default:
        return 'warn';
    }
  }
}
