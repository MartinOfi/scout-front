/**
 * Persona Header Component
 * Displays persona identity, status badge, and navigation actions
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { PersonaDashboardPersona } from '../../../../models';
import {
  PersonaType,
  EstadoPersona,
  CargoEducador,
  RAMA_LABELS,
  CARGO_EDUCADOR_LABELS,
} from '../../../../../../shared/enums';

@Component({
  selector: 'app-persona-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './persona-header.component.html',
  styleUrl: './persona-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonaHeaderComponent {
  readonly persona = input.required<PersonaDashboardPersona>();

  readonly back = output<void>();
  readonly edit = output<void>();
  readonly darDeBaja = output<void>();

  readonly tipoLabels: Record<PersonaType, string> = {
    [PersonaType.PROTAGONISTA]: 'Protagonista',
    [PersonaType.EDUCADOR]: 'Educador',
    [PersonaType.EXTERNA]: 'Persona Externa',
  };

  readonly estadoLabels: Record<EstadoPersona, string> = {
    [EstadoPersona.ACTIVO]: 'Activo',
    [EstadoPersona.INACTIVO]: 'Inactivo',
  };

  readonly ramaLabels = RAMA_LABELS;
  readonly cargoLabels = CARGO_EDUCADOR_LABELS;

  get tipoLabel(): string {
    return this.tipoLabels[this.persona().tipo];
  }

  get estadoIcon(): string {
    return this.persona().estado === EstadoPersona.ACTIVO ? 'check_circle' : 'cancel';
  }
}
