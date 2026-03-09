/**
 * Confirm Dialog Component
 * Dumb Component - Renders confirmation dialog content
 * ChangeDetectionStrategy.OnPush - max 45 lines
 */

import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="confirm-dialog-container">
      <div class="confirm-icon-section">
        <mat-icon [color]="data.isDestructive ? 'warn' : 'accent'">
          {{ data.icon }}
        </mat-icon>
      </div>
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        {{ data.message }}
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">{{ data.cancelText }}</button>
        <button
          mat-raised-button
          [color]="data.isDestructive ? 'warn' : 'primary'"
          (click)="onConfirm()"
        >
          {{ data.confirmText }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog-container {
      min-width: 300px;
    }

    .confirm-icon-section {
      text-align: center;
      margin-bottom: 16px;
    }

    mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    h2 {
      margin: 0 0 8px 0;
    }

    mat-dialog-actions {
      padding-top: 16px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
