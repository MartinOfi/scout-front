/**
 * Empty State Component
 * Dumb Component - Displays when no data is available
 * ChangeDetectionStrategy.OnPush - max 40 lines
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="empty-state-container">
      <mat-icon class="empty-icon">{{ icon() }}</mat-icon>
      <p class="empty-message">{{ message() }}</p>
      <button mat-raised-button color="primary" (click)="onAction.emit()" *ngIf="actionLabel()">
        {{ actionLabel() }}
      </button>
    </div>
  `,
  styleUrls: ['./empty-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icon = input<string>('inbox');
  readonly message = input<string>('No hay datos disponibles');
  readonly actionLabel = input<string | null>(null);

  readonly onAction = output<void>();
}
