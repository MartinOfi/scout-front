/**
 * Cuenta Personal Row Component
 * Dumb Component - max 80 líneas
 * Fila de cuenta personal
 * SIN any - tipado estricto
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

import { PersonaUnion, Protagonista, Educador } from '../../../../../../shared/models';
import { RAMA_LABELS, Rama } from '../../../../../../shared/enums';

@Component({
  selector: 'app-cuenta-personal-row',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatListModule, MatChipsModule],
  templateUrl: './cuenta-personal-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CuentaPersonalRowComponent {
  readonly persona = input.required<PersonaUnion>();
  readonly saldo = input.required<number>();

  readonly verMovimientos = output<void>();
  readonly registrarMovimiento = output<void>();
  readonly verDetalle = output<void>();

  readonly ramaLabels = RAMA_LABELS;

  getRama(persona: PersonaUnion): Rama | null {
    if ('rama' in persona) {
      const rama = (persona as Protagonista | Educador).rama;
      return rama ?? null;
    }
    return null;
  }
}
