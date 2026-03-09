import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UI_CONFIG } from '../constants';

/**
 * Notification service for user feedback
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Show success notification
   */
  showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: UI_CONFIG.SNACKBAR_DURATION,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /**
   * Show error notification
   */
  showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: UI_CONFIG.SNACKBAR_DURATION * 2, // Longer duration for errors
      panelClass: ['snackbar-error'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /**
   * Show warning notification
   */
  showWarning(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: UI_CONFIG.SNACKBAR_DURATION,
      panelClass: ['snackbar-warning'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /**
   * Show info notification
   */
  showInfo(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: UI_CONFIG.SNACKBAR_DURATION,
      panelClass: ['snackbar-info'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
