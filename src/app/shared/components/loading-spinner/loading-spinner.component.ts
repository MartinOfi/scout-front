/**
 * Loading Spinner Component
 * Dumb Component - Shows loading state
 * ChangeDetectionStrategy.OnPush - max 25 lines
 */

import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="spinner-container">
      <mat-spinner diameter="50" color="primary"></mat-spinner>
      <p *ngIf="message()">{{ message() }}</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 32px 16px;
      min-height: 200px;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.54);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerComponent {
  readonly message = input<string>('Cargando...');
}
