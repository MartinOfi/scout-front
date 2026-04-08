/**
 * Producto Dialog Component
 * Thin Material dialog wrapper around ProductoEditorComponent.
 * Stays open while the user manages the producto list.
 */

import { Component, Inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EventosStateService } from '../../../services/eventos-state.service';
import { CreateProductoDto } from '../../../../../shared/models';
import { ProductoEditorComponent } from '../producto-editor/producto-editor.component';

export interface ProductoDialogData {
  eventoId: string;
}

@Component({
  selector: 'app-producto-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ProductoEditorComponent,
  ],
  templateUrl: './producto-dialog.component.html',
  styleUrl: './producto-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoDialogComponent {
  readonly saving = signal(false);

  constructor(
    private readonly dialogRef: MatDialogRef<ProductoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ProductoDialogData,
    private readonly state: EventosStateService,
  ) {}

  onAdd(dto: CreateProductoDto): void {
    this.saving.set(true);
    this.state.createProducto(this.data.eventoId, dto).subscribe({
      next: () => this.dialogRef.close(),
      error: () => this.saving.set(false),
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
