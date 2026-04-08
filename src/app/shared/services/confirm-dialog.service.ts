/**
 * Confirm Dialog Service
 * Orchestrates confirmation dialogs across the application.
 * Supports both simple confirmations and async operations with loading/error states.
 */

import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  ConfirmDialogDetail,
  ConfirmDialogResult,
} from '../components/confirm-dialog/confirm-dialog.component';

/** Legacy alias for backwards compatibility */
export type DeleteDialogResult = ConfirmDialogResult;

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private readonly dialog = inject(MatDialog);

  /**
   * Open a confirmation dialog (simple mode - returns boolean)
   * @param title Dialog title
   * @param message Dialog message
   * @param options Optional configuration (icon, button labels, destructive flag)
   * @returns Observable<boolean> - true if confirmed, false if cancelled
   */
  confirm(
    title: string,
    message: string,
    options?: {
      icon?: string;
      confirmText?: string;
      cancelText?: string;
      isDestructive?: boolean;
    },
  ): Observable<boolean> {
    const data: ConfirmDialogData = {
      title,
      message,
      icon: options?.icon ?? 'help_outline',
      confirmText: options?.confirmText ?? 'Confirmar',
      cancelText: options?.cancelText ?? 'Cancelar',
      isDestructive: options?.isDestructive ?? false,
    };

    const dialogRef: MatDialogRef<ConfirmDialogComponent, boolean> = this.dialog.open(
      ConfirmDialogComponent,
      {
        data,
        width: '400px',
        maxWidth: '90vw',
        disableClose: false,
      },
    );

    return dialogRef.afterClosed().pipe(map((result) => result ?? false));
  }

  /**
   * Confirm deletion with standard parameters (simple confirmation)
   * @param entityName Name of entity being deleted (e.g., "protagonista", "campamento")
   * @returns Observable<boolean> - true if confirmed, false if cancelled
   */
  confirmDelete(entityName: string): Observable<boolean> {
    return this.confirm(
      'Eliminar ' + entityName,
      `¿Estás seguro de que deseas eliminar este ${entityName}? Esta acción no se puede deshacer.`,
      {
        icon: 'delete_outline',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDestructive: true,
      },
    );
  }

  /**
   * Enhanced delete dialog with loading, error, and success states.
   * Handles backend validation errors gracefully.
   *
   * @param entityName Name of entity being deleted (e.g., "inscripción", "campamento")
   * @param deleteFn Function that performs the actual deletion (returns Observable or Promise)
   * @param options Optional configuration (warning message, custom title/message)
   * @returns Observable<ConfirmDialogResult> - result with confirmed status and optional error
   *
   * @example
   * ```typescript
   * this.confirmDialog.delete(
   *   'inscripción',
   *   () => firstValueFrom(this.api.delete(id))
   * ).subscribe(result => {
   *   if (result.confirmed) {
   *     // Refresh list
   *   }
   * });
   * ```
   */
  delete(
    entityName: string,
    deleteFn: () => Promise<void> | Observable<void>,
    options?: {
      title?: string;
      message?: string;
      warning?: string;
    },
  ): Observable<ConfirmDialogResult> {
    const onAction = async (): Promise<void> => {
      const result = deleteFn();
      if (result instanceof Promise) {
        await result;
      } else {
        await firstValueFrom(result);
      }
    };

    const data: ConfirmDialogData = {
      title: options?.title ?? `Eliminar ${entityName}`,
      message:
        options?.message ??
        `¿Estás seguro de que deseas eliminar este ${entityName}? Esta acción no se puede deshacer.`,
      icon: 'delete_outline',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDestructive: true,
      entityName,
      warning: options?.warning,
      onAction,
    };

    const dialogRef: MatDialogRef<ConfirmDialogComponent, ConfirmDialogResult> = this.dialog.open(
      ConfirmDialogComponent,
      {
        data,
        width: '440px',
        maxWidth: '95vw',
        panelClass: 'confirm-dialog-panel',
        disableClose: false,
      },
    );

    return dialogRef.afterClosed().pipe(map((result) => result ?? { confirmed: false }));
  }

  /**
   * Generic async confirmation with loading, error, and success states.
   * Use for non-delete async operations that need visual feedback.
   *
   * @param title Dialog title
   * @param message Dialog message
   * @param actionFn Function that performs the action (returns Observable or Promise)
   * @param options Optional configuration
   * @returns Observable<ConfirmDialogResult>
   */
  confirmAsync(
    title: string,
    message: string,
    actionFn: () => Promise<void> | Observable<void>,
    options?: {
      icon?: string;
      confirmText?: string;
      cancelText?: string;
      entityName?: string;
      warning?: string;
      details?: ConfirmDialogDetail[];
    },
  ): Observable<ConfirmDialogResult> {
    const onAction = async (): Promise<void> => {
      const result = actionFn();
      if (result instanceof Promise) {
        await result;
      } else {
        await firstValueFrom(result);
      }
    };

    const data: ConfirmDialogData = {
      title,
      message,
      icon: options?.icon ?? 'help_outline',
      confirmText: options?.confirmText ?? 'Confirmar',
      cancelText: options?.cancelText ?? 'Cancelar',
      isDestructive: false,
      entityName: options?.entityName,
      warning: options?.warning,
      details: options?.details,
      onAction,
    };

    const dialogRef: MatDialogRef<ConfirmDialogComponent, ConfirmDialogResult> = this.dialog.open(
      ConfirmDialogComponent,
      {
        data,
        width: '440px',
        maxWidth: '95vw',
        panelClass: 'confirm-dialog-panel',
        disableClose: false,
      },
    );

    return dialogRef.afterClosed().pipe(map((result) => result ?? { confirmed: false }));
  }
}
