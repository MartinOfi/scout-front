/**
 * Confirm Dialog Component
 * Dumb Component - Renders confirmation dialog with consistent button styling.
 * Uses GPU-accelerated animations for smooth 60fps entrance.
 */

import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent, ButtonVariant } from '../button/button.component';

export interface ConfirmDialogData {
  title: string;
  message: string;
  icon: string;
  confirmText: string;
  cancelText: string;
  isDestructive: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatIconModule, ButtonComponent],
  template: `
    <div class="confirm-dialog">
      <!-- Icon -->
      <div class="confirm-dialog__icon" [class]="iconContainerClass()">
        <mat-icon>{{ data.icon }}</mat-icon>
      </div>

      <!-- Title -->
      <h2 class="confirm-dialog__title">{{ data.title }}</h2>

      <!-- Message -->
      <p class="confirm-dialog__message">{{ data.message }}</p>

      <!-- Actions -->
      <div class="confirm-dialog__actions">
        <app-button variant="secondary" (clicked)="onCancel()">
          {{ data.cancelText }}
        </app-button>
        <app-button [variant]="confirmVariant()" (clicked)="onConfirm()">
          {{ data.confirmText }}
        </app-button>
      </div>
    </div>
  `,
  styles: [
    `
      @use '../../../shared/styles/tokens' as t;

      :host {
        display: block;
        animation: dialog-enter 200ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes dialog-enter {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-8px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        :host {
          animation: none;
        }
      }

      .confirm-dialog {
        padding: 24px;
        min-width: 320px;
        max-width: 400px;
        text-align: center;

        &__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          margin-bottom: 16px;

          mat-icon {
            font-size: 28px;
            width: 28px;
            height: 28px;
          }

          &--destructive {
            background: rgba(220, 38, 38, 0.1);
            color: t.$color-error;
          }

          &--default {
            background: rgba(129, 33, 40, 0.1);
            color: t.$brand-burgundy;
          }
        }

        &__title {
          margin: 0 0 8px;
          font-size: 1.125rem;
          font-weight: 600;
          color: t.$stone-800;
        }

        &__message {
          margin: 0 0 24px;
          font-size: 0.9375rem;
          line-height: 1.5;
          color: t.$stone-600;
        }

        &__actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);

  readonly confirmVariant = computed<ButtonVariant>(() =>
    this.data.isDestructive ? 'danger' : 'primary',
  );

  readonly iconContainerClass = computed(
    () =>
      `confirm-dialog__icon confirm-dialog__icon--${this.data.isDestructive ? 'destructive' : 'default'}`,
  );

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
