/**
 * Ingreso Evento Dialog Component
 * Thin Material dialog wrapper around IngresoFormComponent
 * Adapts IngresoFormValue → RegistrarIngresoEventoDto
 */

import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { Persona, RegistrarIngresoEventoDto } from '../../../../../shared/models';
import { MedioPagoEnum } from '../../../../../shared/enums';
import {
  IngresoFormComponent,
  IngresoFormValue,
} from '../../../../../shared/components/ingreso-form/ingreso-form.component';

export interface IngresoEventoDialogData {
  responsables: Persona[];
}

export interface IngresoEventoDialogResult {
  dto: RegistrarIngresoEventoDto;
}

@Component({
  selector: 'app-ingreso-evento-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, IngresoFormComponent],
  templateUrl: './ingreso-evento-dialog.component.html',
  styleUrl: './ingreso-evento-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngresoEventoDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<
      IngresoEventoDialogComponent,
      IngresoEventoDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public readonly data: IngresoEventoDialogData,
  ) {}

  onFormSubmit(value: IngresoFormValue): void {
    const dto: RegistrarIngresoEventoDto = {
      monto: value.monto,
      descripcion: value.descripcion,
      responsableId: value.responsableId,
      medioPago: value.medioPago as MedioPagoEnum,
    };
    this.dialogRef.close({ dto });
  }

  onCancel(): void {
    this.dialogRef.close(undefined);
  }
}
