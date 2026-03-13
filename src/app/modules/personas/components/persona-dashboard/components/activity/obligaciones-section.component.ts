/**
 * Obligaciones Section Component
 * Displays inscripciones and cuotas with tab navigation
 * Uses ButtonTabs for switching between views
 */

/**
 * Obligaciones Section Component
 * Displays inscripciones and cuotas as two separate cards
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { InscripcionesResumen, CuotasResumen } from '../../../../models';
import {
  TIPO_INSCRIPCION_LABELS,
  ESTADO_INSCRIPCION_LABELS,
  ESTADO_CUOTA_LABELS,
} from '../../../../../../shared/enums';

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
  readonly cuotas = input.required<CuotasResumen>();

  readonly inscripcionClick = output<string>();
  readonly cuotaClick = output<string>();

  readonly tipoInscripcionLabels = TIPO_INSCRIPCION_LABELS;
  readonly estadoInscripcionLabels = ESTADO_INSCRIPCION_LABELS;
  readonly estadoCuotaLabels = ESTADO_CUOTA_LABELS;
}
