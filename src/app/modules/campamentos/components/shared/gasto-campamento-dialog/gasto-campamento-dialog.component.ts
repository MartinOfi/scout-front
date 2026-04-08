/**
 * Gasto Campamento Dialog Component
 * Dialog wrapper for registering camp expenses
 */

import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { RegistrarGastoCampamentoDto } from '../../../../../shared/models';
import { Persona } from '../../../../../shared/models';
import {
  GastoCampamentoFormComponent,
  GastoFormValue,
} from '../gasto-campamento-form/gasto-campamento-form.component';

export interface GastoCampamentoDialogData {
  campamentoId: string;
  responsables: Persona[];
}

export interface GastoCampamentoDialogResult {
  dto: RegistrarGastoCampamentoDto;
}

@Component({
  selector: 'app-gasto-campamento-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, GastoCampamentoFormComponent],
  templateUrl: './gasto-campamento-dialog.component.html',
  styleUrl: './gasto-campamento-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GastoCampamentoDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<
      GastoCampamentoDialogComponent,
      GastoCampamentoDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public readonly data: GastoCampamentoDialogData,
  ) {}

  onFormSubmit(value: GastoFormValue): void {
    const dto: RegistrarGastoCampamentoDto = {
      monto: value.monto,
      descripcion: value.descripcion,
      responsableId: value.responsableId,
      medioPago: value.medioPago,
      estadoPago: value.estadoPago,
      fecha: value.fecha,
      personaAReembolsarId: value.personaAReembolsarId,
    };
    this.dialogRef.close({ dto });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
