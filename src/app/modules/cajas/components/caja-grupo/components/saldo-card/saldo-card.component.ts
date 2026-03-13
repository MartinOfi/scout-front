/**
 * Saldo Card Component
 * Dumb Component - max 80 líneas
 * Muestra el saldo de una caja
 * SIN any - tipado estricto
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-saldo-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatRippleModule],
  templateUrl: './saldo-card.component.html',
  styleUrls: ['./saldo-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaldoCardComponent {
  readonly saldo = input.required<number>();
  readonly nombre = input.required<string>();
  readonly tipo = input.required<string>();

  /** Emits when the card is clicked to view details */
  readonly cardClick = output<void>();
}
