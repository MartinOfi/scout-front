/**
 * Confirm Dialog Service
 * Orchestrates confirmation dialogs across the application
 * Type-safe, no any types
 */

import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfirmDialogComponent, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private readonly dialog = inject(MatDialog);

  /**
   * Open a confirmation dialog
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
    }
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
      }
    );

    return dialogRef.afterClosed().pipe(map(result => result ?? false));
  }

  /**
   * Confirm deletion with standard parameters
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
      }
    );
  }
}
