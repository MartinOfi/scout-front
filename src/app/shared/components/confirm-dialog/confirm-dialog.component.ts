/**
 * Confirm Dialog Component
 * Universal confirmation dialog supporting both simple confirmations and async operations.
 *
 * Simple mode: Just returns boolean on confirm/cancel
 * Async mode: When onAction is provided, shows loading → success/error states
 *
 * Uses GPU-accelerated animations for smooth 60fps entrance.
 */

import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonComponent, ButtonVariant } from '../button/button.component';

/** Dialog states for async operations */
export type ConfirmDialogState = 'confirm' | 'loading' | 'error' | 'success';

/** Configuration for the confirm dialog */
export interface ConfirmDialogData {
  /** Dialog title */
  title: string;
  /** Main message to display */
  message: string;
  /** Material icon name */
  icon: string;
  /** Text for confirm button */
  confirmText: string;
  /** Text for cancel button */
  cancelText: string;
  /** Whether the action is destructive (changes button color to danger) */
  isDestructive: boolean;

  // Optional async mode properties
  /** Optional warning message displayed in amber box */
  warning?: string;
  /** Entity name for loading/success messages (e.g., "inscripción") */
  entityName?: string;
  /** Async callback - when provided, enables state machine mode */
  onAction?: () => Promise<void>;
}

/** Result returned when dialog closes */
export interface ConfirmDialogResult {
  /** Whether the action was confirmed/completed */
  confirmed: boolean;
  /** Error message if action failed */
  error?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, ButtonComponent],
  template: `
    <div class="confirm-dialog">
      <!-- Confirm State -->
      @if (state() === 'confirm') {
        <!-- Icon -->
        <div class="confirm-dialog__icon" [class]="iconContainerClass()">
          <mat-icon>{{ data.icon }}</mat-icon>
        </div>

        <!-- Title -->
        <h2 class="confirm-dialog__title">{{ data.title }}</h2>

        <!-- Message -->
        <p class="confirm-dialog__message">{{ data.message }}</p>

        <!-- Warning Box (optional) -->
        @if (data.warning) {
          <div class="confirm-dialog__warning">
            <mat-icon>warning_amber</mat-icon>
            <span>{{ data.warning }}</span>
          </div>
        }

        <!-- Actions -->
        <div class="confirm-dialog__actions">
          <app-button variant="secondary" (clicked)="onCancel()">
            {{ data.cancelText }}
          </app-button>
          <app-button
            [variant]="confirmVariant()"
            [icon]="data.isDestructive ? 'delete' : null"
            (clicked)="onConfirm()"
          >
            {{ data.confirmText }}
          </app-button>
        </div>
      }

      <!-- Loading State -->
      @if (state() === 'loading') {
        <div class="confirm-dialog__icon">
          <mat-spinner diameter="48" color="primary"></mat-spinner>
        </div>

        <h2 class="confirm-dialog__title">Procesando...</h2>

        <p class="confirm-dialog__message confirm-dialog__message--muted">
          {{ loadingMessage() }}
        </p>
      }

      <!-- Error State -->
      @if (state() === 'error') {
        <div class="confirm-dialog__icon confirm-dialog__icon--destructive">
          <mat-icon>error_outline</mat-icon>
        </div>

        <h2 class="confirm-dialog__title confirm-dialog__title--danger">No se pudo completar</h2>

        <div class="confirm-dialog__error">
          <p class="confirm-dialog__error-message">{{ errorMessage() }}</p>
          @if (errorHint()) {
            <p class="confirm-dialog__error-hint">{{ errorHint() }}</p>
          }
        </div>

        <div class="confirm-dialog__actions confirm-dialog__actions--center">
          <app-button variant="primary" (clicked)="onClose()"> Entendido </app-button>
        </div>
      }

      <!-- Success State -->
      @if (state() === 'success') {
        <div class="confirm-dialog__icon confirm-dialog__icon--success">
          <mat-icon>check_circle_outline</mat-icon>
        </div>

        <h2 class="confirm-dialog__title confirm-dialog__title--success">
          {{ successTitle() }}
        </h2>

        <p class="confirm-dialog__message confirm-dialog__message--success">
          {{ successMessage() }}
        </p>
      }
    </div>
  `,
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent, ConfirmDialogResult | boolean>);
  readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);

  // State machine for async operations
  readonly state = signal<ConfirmDialogState>('confirm');
  readonly errorMessage = signal<string>('');
  readonly errorHint = signal<string>('');

  /** Whether this dialog runs in async mode (has onAction callback) */
  readonly isAsyncMode = computed(() => !!this.data.onAction);

  readonly confirmVariant = computed<ButtonVariant>(() =>
    this.data.isDestructive ? 'danger' : 'primary',
  );

  readonly iconContainerClass = computed(
    () =>
      `confirm-dialog__icon confirm-dialog__icon--${this.data.isDestructive ? 'destructive' : 'default'}`,
  );

  readonly loadingMessage = computed(() => {
    const entity = this.data.entityName ?? 'registro';
    return this.data.isDestructive
      ? `Eliminando ${entity}. Por favor espera.`
      : `Procesando ${entity}. Por favor espera.`;
  });

  readonly successTitle = computed(() => {
    return this.data.isDestructive ? 'Eliminado correctamente' : 'Completado';
  });

  readonly successMessage = computed(() => {
    const entity = this.data.entityName ?? 'Registro';
    const titleCase = entity.charAt(0).toUpperCase() + entity.slice(1);
    return this.data.isDestructive
      ? `${titleCase} eliminado exitosamente.`
      : `${titleCase} procesado exitosamente.`;
  });

  onCancel(): void {
    if (this.isAsyncMode()) {
      this.dialogRef.close({ confirmed: false });
    } else {
      this.dialogRef.close(false);
    }
  }

  async onConfirm(): Promise<void> {
    // Simple mode - just close with true
    if (!this.data.onAction) {
      this.dialogRef.close(true);
      return;
    }

    // Async mode - execute action with state machine
    this.state.set('loading');
    this.dialogRef.disableClose = true;

    try {
      await this.data.onAction();
      this.state.set('success');
      // Auto-close after success
      setTimeout(() => {
        this.dialogRef.close({ confirmed: true });
      }, 1200);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.dialogRef.disableClose = false;
    }
  }

  onClose(): void {
    if (this.isAsyncMode()) {
      this.dialogRef.close({ confirmed: false, error: this.errorMessage() });
    } else {
      this.dialogRef.close(false);
    }
  }

  private handleError(error: unknown): void {
    this.state.set('error');

    let message = 'Ocurrió un error inesperado. Intenta nuevamente.';
    let hint = '';

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>;

      // Handle HTTP error response
      if (err['error'] && typeof err['error'] === 'object') {
        const httpError = err['error'] as Record<string, unknown>;
        message = (httpError['message'] as string) ?? message;
      } else if (err['message']) {
        message = err['message'] as string;
      }

      // Parse specific error types and provide helpful hints
      if (message.includes('movimiento(s) asociado(s)')) {
        hint =
          'Primero debes eliminar los movimientos relacionados antes de poder eliminar este registro.';
      } else if (message.includes('no encontrad')) {
        hint = 'Es posible que este registro ya haya sido eliminado.';
      }
    }

    this.errorMessage.set(message);
    this.errorHint.set(hint);
  }
}
