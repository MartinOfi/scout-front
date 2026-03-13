/**
 * Delete Dialog Component
 * Enhanced deletion dialog with loading, error, and success states
 * Handles backend validation errors gracefully
 * Uses design system tokens and shared button patterns
 */

import { Component, ChangeDetectionStrategy, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type DeleteDialogState = 'confirm' | 'loading' | 'error' | 'success';

export interface DeleteDialogData {
  /** Name of the entity being deleted (e.g., "inscripción", "campamento") */
  entityName: string;
  /** Optional custom title (defaults to "Eliminar {entityName}") */
  title?: string;
  /** Optional custom confirmation message */
  message?: string;
  /** Optional additional warning (e.g., "Esta acción eliminará también los pagos asociados") */
  warning?: string;
  /** Callback that performs the actual deletion - returns Observable or Promise */
  onDelete: () => Promise<void>;
}

export interface DeleteDialogResult {
  deleted: boolean;
  error?: string;
}

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './delete-dialog.component.html',
  styleUrl: './delete-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteDialogComponent {
  readonly state = signal<DeleteDialogState>('confirm');
  readonly errorMessage = signal<string>('');
  readonly errorHint = signal<string>('');

  readonly title: string;
  readonly message: string;

  constructor(
    public dialogRef: MatDialogRef<DeleteDialogComponent, DeleteDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteDialogData,
  ) {
    this.title = data.title ?? `Eliminar ${data.entityName}`;
    this.message =
      data.message ??
      `¿Estás seguro de que deseas eliminar este ${data.entityName}? Esta acción no se puede deshacer.`;

    // Prevent closing while loading
    dialogRef.disableClose = false;
  }

  onCancel(): void {
    this.dialogRef.close({ deleted: false });
  }

  async onConfirm(): Promise<void> {
    this.state.set('loading');
    this.dialogRef.disableClose = true;

    try {
      await this.data.onDelete();
      this.state.set('success');
      // Auto-close after success
      setTimeout(() => {
        this.dialogRef.close({ deleted: true });
      }, 1200);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.dialogRef.disableClose = false;
    }
  }

  onClose(): void {
    this.dialogRef.close({ deleted: false, error: this.errorMessage() });
  }

  private handleError(error: unknown): void {
    this.state.set('error');

    // Extract error message from different error formats
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
