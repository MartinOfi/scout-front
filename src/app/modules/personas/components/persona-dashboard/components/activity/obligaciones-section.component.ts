/**
 * Obligaciones Section Component
 * Displays inscripciones and campamentos as two separate cards
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { InscripcionesResumen, CampamentosResumen } from '../../../../models';
import { TIPO_INSCRIPCION_LABELS, ESTADO_INSCRIPCION_LABELS } from '../../../../../../shared/enums';

@Component({
  selector: 'app-obligaciones-section',
  standalone: true,
  imports: [CommonModule, MatIconModule, CurrencyPipe],
  templateUrl: './obligaciones-section.component.html',
  styleUrl: './obligaciones-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObligacionesSectionComponent {
  readonly inscripciones = input.required<InscripcionesResumen>();
  readonly campamentos = input.required<CampamentosResumen>();

  readonly inscripcionClick = output<string>();
  readonly campamentoClick = output<string>();

  readonly tipoInscripcionLabels = TIPO_INSCRIPCION_LABELS;
  readonly estadoInscripcionLabels = ESTADO_INSCRIPCION_LABELS;
}
