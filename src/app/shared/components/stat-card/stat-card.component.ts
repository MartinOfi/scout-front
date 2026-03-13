/**
 * StatCard Component
 * Reusable component for displaying metrics with icon, title, and value
 */

import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type StatCardVariant = 'success' | 'info' | 'warning' | 'danger';
export type StatCardFormat = 'currency' | 'number' | 'percent';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [MatIconModule, CurrencyPipe, DecimalPipe, PercentPipe],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly value = input.required<number>();
  readonly variant = input<StatCardVariant>('info');
  readonly format = input<StatCardFormat>('number');
}
