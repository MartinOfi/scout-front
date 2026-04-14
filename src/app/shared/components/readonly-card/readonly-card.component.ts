/**
 * Readonly Card Component
 * Displays a labeled, read-only summary block with icon + title + optional meta.
 * Used for fixed/immutable values inside forms (e.g. origen fijo en transferencia).
 */

import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-readonly-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './readonly-card.component.html',
  styleUrl: './readonly-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadonlyCardComponent {
  readonly label = input<string>('');
  readonly icon = input<string | null>(null);
  readonly title = input<string>('');
  readonly meta = input<string | null>(null);
}
