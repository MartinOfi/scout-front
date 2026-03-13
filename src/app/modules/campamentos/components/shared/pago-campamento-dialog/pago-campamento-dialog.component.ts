/**
 * Pago Campamento Dialog Component
 * Dialog for registering/editing payments on campamentos
 */

import { Component, Inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { MedioPago, MedioPagoEnum, MEDIO_PAGO_LABELS } from '../../../../../shared/enums';
import { PagoDetalle } from '../../../../../shared/models';

// Shared Form Components
import { FormFieldComponent } from '../../../../../shared/components/form/form-field/form-field.component';
import { NumberFieldComponent } from '../../../../../shared/components/form/number-field/number-field.component';
import { SelectFieldComponent } from '../../../../../shared/components/form/select-field/select-field.component';
import { TextareaFieldComponent } from '../../../../../shared/components/form/textarea-field/textarea-field.component';

/**
 * Data passed to the dialog
 */
export interface PagoCampamentoDialogData {
  campamentoId: string;
  participanteId: string;
  participanteNombre: string;
  costoPorPersona: number;
  totalPagado: number;
  montoPendiente: number;
  saldoCuentaPersonal?: number;
  /** Edit mode: provide existing payment data */
  mode?: 'create' | 'edit';
  existingPago?: PagoDetalle;
}

/**
 * Form data returned by the dialog (create mode)
 */
export interface PagoCampamentoCreateData {
  monto: number;
  medioPago: MedioPago;
  descripcion?: string;
}

/**
 * Form data returned by the dialog (edit mode)
 */
export interface PagoCampamentoEditData {
  monto: number;
  medioPago: MedioPago;
  descripcion?: string;
}

/**
 * Union type for dialog result
 */
export type PagoCampamentoDialogResult =
  | { mode: 'create'; data: PagoCampamentoCreateData }
  | { mode: 'edit'; data: PagoCampamentoEditData; movimientoId: string }
  | { mode: 'delete'; movimientoId: string };

interface MedioPagoOption {
  value: MedioPago;
  label: string;
}

@Component({
  selector: 'app-pago-campamento-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    FormFieldComponent,
    NumberFieldComponent,
    SelectFieldComponent,
    TextareaFieldComponent,
  ],
  templateUrl: './pago-campamento-dialog.component.html',
  styleUrl: './pago-campamento-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagoCampamentoDialogComponent implements OnInit {
  form!: FormGroup;

  readonly mediosPagoOptions: MedioPagoOption[] = [
    { value: 'efectivo', label: MEDIO_PAGO_LABELS['efectivo'] },
    { value: 'transferencia', label: MEDIO_PAGO_LABELS['transferencia'] },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<
      PagoCampamentoDialogComponent,
      PagoCampamentoDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public readonly data: PagoCampamentoDialogData,
  ) {}

  ngOnInit(): void {
    if (this.isEditMode) {
      // Edit mode: populate with existing values
      const existing = this.data.existingPago!;
      this.form = this.fb.group({
        monto: [existing.monto, [Validators.required, Validators.min(1)]],
        medioPago: [existing.medioPago, [Validators.required]],
        descripcion: [existing.descripcion ?? ''],
      });
    } else {
      // Create mode
      this.form = this.fb.group({
        monto: [0, [Validators.required, Validators.min(1), Validators.max(this.data.montoPendiente)]],
        medioPago: [MedioPagoEnum.EFECTIVO, [Validators.required]],
        descripcion: [''],
      });
    }
  }

  get isEditMode(): boolean {
    return this.data.mode === 'edit' && !!this.data.existingPago;
  }

  get montoPendiente(): number {
    return this.data.montoPendiente;
  }

  /** In edit mode, max allowed = pending + existing (since we're replacing) */
  get maxAllowedMonto(): number {
    if (this.isEditMode && this.data.existingPago) {
      return this.data.montoPendiente + this.data.existingPago.monto;
    }
    return this.data.montoPendiente;
  }

  get saldoCuentaPersonal(): number {
    return this.data.saldoCuentaPersonal ?? 0;
  }

  get puedeUsarSaldo(): boolean {
    return this.saldoCuentaPersonal > 0 && !this.isEditMode;
  }

  get montoTotalPago(): number {
    return this.form.get('monto')?.value || 0;
  }

  get montoRestante(): number {
    if (this.isEditMode) {
      // In edit mode, show remaining after this payment would be applied
      const existingMonto = this.data.existingPago?.monto ?? 0;
      const newMonto = this.form.get('monto')?.value || 0;
      const pendienteWithExisting = this.montoPendiente + existingMonto;
      return Math.max(0, pendienteWithExisting - newMonto);
    }
    return Math.max(0, this.montoPendiente - this.montoTotalPago);
  }

  get progressPercent(): number {
    const { costoPorPersona, totalPagado } = this.data;
    if (costoPorPersona <= 0) return 100;
    return Math.min(100, Math.round((totalPagado / costoPorPersona) * 100));
  }

  get formInvalid(): boolean {
    if (this.form.invalid) return true;

    const monto = this.form.get('monto')?.value || 0;
    if (monto <= 0) return true;
    if (monto > this.maxAllowedMonto) return true;

    return false;
  }

  // Callbacks for select field
  getMedioPagoValue = (option: MedioPagoOption): MedioPago => option.value;
  getMedioPagoLabel = (option: MedioPagoOption): string => option.label;

  usarSaldoDisponible(): void {
    const montoAUsar = Math.min(this.saldoCuentaPersonal, this.montoPendiente);
    this.form.patchValue({ monto: montoAUsar });
  }

  pagarTodo(): void {
    this.form.patchValue({ monto: this.montoPendiente });
  }

  onSubmit(): void {
    if (this.formInvalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;

    if (this.isEditMode) {
      const result: PagoCampamentoDialogResult = {
        mode: 'edit',
        movimientoId: this.data.existingPago!.movimientoId,
        data: {
          monto: Number(formValue.monto),
          medioPago: formValue.medioPago as MedioPago,
          descripcion: formValue.descripcion || undefined,
        },
      };
      this.dialogRef.close(result);
    } else {
      const result: PagoCampamentoDialogResult = {
        mode: 'create',
        data: {
          monto: Number(formValue.monto),
          medioPago: formValue.medioPago as MedioPago,
          descripcion: formValue.descripcion || undefined,
        },
      };
      this.dialogRef.close(result);
    }
  }

  onDelete(): void {
    if (!this.isEditMode || !this.data.existingPago) return;

    const result: PagoCampamentoDialogResult = {
      mode: 'delete',
      movimientoId: this.data.existingPago.movimientoId,
    };
    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
