/**
 * Gasto Evento Dialog Component
 * Thin Material dialog adapter — wraps GastoCampamentoFormComponent
 * Maps GastoFormValue → RegistrarGastoEventoDto (strips the fecha field)
 */

import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { Persona, RegistrarGastoEventoDto } from '../../../../../shared/models';
import { MedioPagoEnum } from '../../../../../shared/enums';
import {
  GastoCampamentoFormComponent,
  GastoFormValue,
} from '../../../../campamentos/components/shared/gasto-campamento-form/gasto-campamento-form.component';

export interface GastoEventoDialogData {
  responsables: Persona[];
}

export interface GastoEventoDialogResult {
  dto: RegistrarGastoEventoDto;
}

@Component({
  selector: 'app-gasto-evento-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, GastoCampamentoFormComponent],
  templateUrl: './gasto-evento-dialog.component.html',
  styleUrl: './gasto-evento-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GastoEventoDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<GastoEventoDialogComponent, GastoEventoDialogResult>,
    @Inject(MAT_DIALOG_DATA) public readonly data: GastoEventoDialogData,
  ) {}

  onFormSubmit(value: GastoFormValue): void {
    // fecha is campamentos-specific; RegistrarGastoEventoDto does not include it
    const dto: RegistrarGastoEventoDto = {
      monto: value.monto,
      descripcion: value.descripcion,
      responsableId: value.responsableId,
      medioPago: value.medioPago as MedioPagoEnum,
      estadoPago: value.estadoPago,
      personaAReembolsarId: value.personaAReembolsarId,
    };
    this.dialogRef.close({ dto });
  }

  onCancel(): void {
    this.dialogRef.close(undefined);
  }
}
