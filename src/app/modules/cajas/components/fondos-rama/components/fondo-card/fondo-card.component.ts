/**
 * Fondo Card Component
 * Dumb Component - max 80 líneas
 * Tarjeta de fondo de rama
 * SIN any - tipado estricto
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

import { Rama } from '../../../../../../shared/enums';

@Component({
  selector: 'app-fondo-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatRippleModule],
  templateUrl: './fondo-card.component.html',
  styleUrls: ['./fondo-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FondoCardComponent {
  readonly rama = input.required<Rama>();
  readonly saldo = input.required<number>();
  readonly icon = input.required<string>();
  readonly label = input.required<string>();

  readonly verMovimientos = output<void>();
  readonly registrarMovimiento = output<void>();

  /** Emits when the card header is clicked to open drawer */
  readonly cardClick = output<void>();
}
