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
  styles: [`
    .empty-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 16px;
      gap: 16px;
      color: rgba(0, 0, 0, 0.54);
      min-height: 300px;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(0, 0, 0, 0.26);
    }

    .empty-message {
      font-size: 16px;
      margin: 0;
      text-align: center;
      max-width: 400px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  readonly icon = input<string>('inbox');
  readonly message = input<string>('No hay datos disponibles');
  readonly actionLabel = input<string | null>(null);

  readonly onAction = output<void>();
}
