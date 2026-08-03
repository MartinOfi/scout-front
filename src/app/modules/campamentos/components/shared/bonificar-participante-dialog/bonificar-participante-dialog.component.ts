/**
 * Bonificar Participante Dialog Component
 * Dialog for bonifying a campamento participant against the fondo solidario
 */

import { Component, Inject, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { CajasStateService } from '../../../../cajas/services/cajas-state.service';
import { MoneyPipe } from '../../../../../shared/pipes';
import { FormFieldComponent } from '../../../../../shared/components/form/form-field/form-field.component';
import { NumberFieldComponent } from '../../../../../shared/components/form/number-field/number-field.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

/**
 * Data passed to the dialog
 */
export interface BonificarParticipanteDialogData {
  campamentoId: string;
  personaId: string;
  participanteNombre: string;
  montoAsignado: number;
  montoBonificadoActual: number;
}

/**
 * Result returned by the dialog: the new total bonificado (not a delta)
 */
export interface BonificarParticipanteDialogResult {
  monto: number;
}

@Component({
  selector: 'app-bonificar-participante-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    FormFieldComponent,
    NumberFieldComponent,
    ButtonComponent,
    MoneyPipe,
  ],
  templateUrl: './bonificar-participante-dialog.component.html',
  styleUrl: './bonificar-participante-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BonificarParticipanteDialogComponent {
  private readonly cajasState = inject(CajasStateService);

  /** Saldo disponible del fondo solidario (signal reactivo desde CajasStateService) */
  readonly saldoFondo = this.cajasState.saldoFondoSolidario;

  readonly form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<
      BonificarParticipanteDialogComponent,
      BonificarParticipanteDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public readonly data: BonificarParticipanteDialogData,
  ) {
    this.form = this.fb.group({
      monto: [data.montoBonificadoActual, [Validators.required, Validators.min(0)]],
    });
    this.cajasState.loadFondoSolidario();
  }

  private get montoIngresado(): number {
    return Number(this.form.value.monto) || 0;
  }

  /** Ajustar de 5.000 a 6.000 sólo necesita 1.000 nuevos en el fondo, no 6.000. */
  get montoAdicional(): number {
    return Math.max(0, this.montoIngresado - this.data.montoBonificadoActual);
  }

  get saldoInsuficiente(): boolean {
    return this.montoAdicional > this.saldoFondo();
  }

  get excedeAsignado(): boolean {
    return this.montoIngresado > this.data.montoAsignado;
  }

  get puedeConfirmar(): boolean {
    return this.form.valid && !this.saldoInsuficiente && !this.excedeAsignado;
  }

  onBonificarTodo(): void {
    this.form.patchValue({ monto: this.data.montoAsignado });
  }

  onConfirmar(): void {
    if (!this.puedeConfirmar) return;
    this.dialogRef.close({ monto: this.montoIngresado });
  }

  onCancelar(): void {
    this.dialogRef.close();
  }
}
