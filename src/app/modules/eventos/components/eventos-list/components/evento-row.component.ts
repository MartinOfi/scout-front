/**
 * Evento Row Component
 * Dumb Component - max 80 lineas
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Evento } from '../../../../../shared/models';
import { TIPO_EVENTO_LABELS } from '../../../../../shared/enums';

@Component({
  selector: 'app-evento-row',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './evento-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventoRowComponent {
  readonly evento = input.required<Evento>();
  readonly select = output<string>();
  readonly edit = output<string>();
  readonly tipoLabels = TIPO_EVENTO_LABELS;
}
