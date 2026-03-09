/**
 * Inscripcion Row Component
 * Dumb Component - max 80 líneas
 * Note: This component displays basic inscripcion info.
 * Payment state (montoPagado, estado) must be fetched via GET /:id
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { Inscripcion } from '../../../../../shared/models';
import { TIPO_INSCRIPCION_LABELS } from '../../../../../shared/enums';

@Component({
  selector: 'app-inscripcion-row',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatChipsModule, MatCardModule],
  templateUrl: './inscripcion-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InscripcionRowComponent {
  readonly inscripcion = input.required<Inscripcion>();
  readonly select = output<string>();
  readonly edit = output<string>();
  readonly delete = output<string>();
  readonly tipoLabels = TIPO_INSCRIPCION_LABELS;

  get montoAPagar(): number {
    const insc = this.inscripcion();
    return insc.montoTotal - insc.montoBonificado;
  }
}
