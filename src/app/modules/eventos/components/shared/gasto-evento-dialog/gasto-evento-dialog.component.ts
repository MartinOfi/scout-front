/**
 * Gasto Evento Dialog Component
 * Thin Material dialog adapter — wraps GastoCampamentoFormComponent
 * Maps GastoFormValue → RegistrarGastoEventoDto and calls the API directly.
 */

import { Component, Inject, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Persona, RegistrarGastoEventoDto } from '../../../../../shared/models';
import { MedioPagoEnum } from '../../../../../shared/enums';
import {
  GastoCampamentoFormComponent,
  GastoFormValue,
} from '../../../../campamentos/components/shared/gasto-campamento-form/gasto-campamento-form.component';
import { EventosStateService } from '../../../services/eventos-state.service';

export interface GastoEventoDialogData {
  eventoId: string;
  responsables: Persona[];
}

@Component({
  selector: 'app-gasto-evento-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatProgressSpinnerModule, GastoCampamentoFormComponent],
  templateUrl: './gasto-evento-dialog.component.html',
  styleUrl: './gasto-evento-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GastoEventoDialogComponent {
  private readonly state = inject(EventosStateService);

  readonly saving = signal(false);

  constructor(
    private readonly dialogRef: MatDialogRef<GastoEventoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: GastoEventoDialogData,
  ) {}

  onFormSubmit(value: GastoFormValue): void {
    const dto: RegistrarGastoEventoDto = {
      monto: value.monto,
      descripcion: value.descripcion,
      responsableId: value.responsableId,
      medioPago: value.medioPago as MedioPagoEnum,
      estadoPago: value.estadoPago,
      personaAReembolsarId: value.personaAReembolsarId,
    };

    this.saving.set(true);
    this.state.registrarGasto(this.data.eventoId, dto).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.saving.set(false),
    });
  }

  onCancel(): void {
    this.dialogRef.close(undefined);
  }
}
