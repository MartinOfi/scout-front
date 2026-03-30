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
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

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
 * Supports mixed payments (cash/transfer + personal account balance)
 */
export interface PagoCampamentoCreateData {
  /** Amount paid in cash/transfer */
  montoPagado: number;
  /** Amount to deduct from personal account */
  montoConSaldoPersonal: number;
  /** Payment method (required if montoPagado > 0) */
  medioPago?: MedioPago;
  /** Optional description */
  descripcion?: string;
}

/**
 * Form data returned by the dialog (edit mode)
 * Note: Edit mode only supports single payment type (no mixed)
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
    ButtonComponent,
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
      // Edit mode: populate with existing values (single payment type)
      const existing = this.data.existingPago!;
      this.form = this.fb.group({
        monto: [existing.monto, [Validators.required, Validators.min(1)]],
        medioPago: [existing.medioPago, [Validators.required]],
        descripcion: [existing.descripcion ?? ''],
      });
    } else {
      // Create mode: supports mixed payments
      this.form = this.fb.group({
        montoPagado: [0, [Validators.min(0)]],
        montoConSaldoPersonal: [0, [Validators.min(0)]],
        medioPago: [MedioPagoEnum.EFECTIVO],
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

  /** Amount from cash/transfer (create mode) or single amount (edit mode) */
  get montoPagado(): number {
    if (this.isEditMode) {
      return this.form.get('monto')?.value || 0;
    }
    return this.form.get('montoPagado')?.value || 0;
  }

  /** Amount from personal account (create mode only) */
  get montoConSaldoPersonal(): number {
    if (this.isEditMode) return 0;
    return this.form.get('montoConSaldoPersonal')?.value || 0;
  }

  /** Total payment = cash + personal account */
  get montoTotalPago(): number {
    return this.montoPagado + this.montoConSaldoPersonal;
  }

  /** Maximum that can be used from personal account */
  get maxSaldoPersonalUsable(): number {
    return Math.min(this.saldoCuentaPersonal, this.montoPendiente);
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

    if (this.isEditMode) {
      // Edit mode: validate single amount
      const monto = this.form.get('monto')?.value || 0;
      if (monto <= 0) return true;
      if (monto > this.maxAllowedMonto) return true;
    } else {
      // Create mode: validate mixed payment
      const total = this.montoTotalPago;
      if (total <= 0) return true;
      if (total > this.montoPendiente) return true;
      // If cash payment > 0, medio pago is required
      if (this.montoPagado > 0 && !this.form.get('medioPago')?.value) return true;
      // Cannot use more personal balance than available
      if (this.montoConSaldoPersonal > this.saldoCuentaPersonal) return true;
    }

    return false;
  }

  // Callbacks for select field
  getMedioPagoValue = (option: MedioPagoOption): MedioPago => option.value;
  getMedioPagoLabel = (option: MedioPagoOption): string => option.label;

  /** Use all available personal account balance (up to pending amount) */
  usarSaldoDisponible(): void {
    const montoAUsar = Math.min(this.saldoCuentaPersonal, this.montoPendiente);
    this.form.patchValue({ montoConSaldoPersonal: montoAUsar });
  }

  /** Pay full pending amount with cash/transfer */
  pagarTodo(): void {
    if (this.isEditMode) {
      // In edit mode, use maxAllowedMonto (pending + existing payment being edited)
      this.form.patchValue({ monto: this.maxAllowedMonto });
    } else {
      this.form.patchValue({
        montoPagado: this.montoPendiente,
        montoConSaldoPersonal: 0,
      });
    }
  }

  /** Pay full pending using personal account first, then cash for remainder */
  pagarTodoConSaldo(): void {
    if (this.isEditMode) return;

    const saldoUsable = Math.min(this.saldoCuentaPersonal, this.montoPendiente);
    const remainder = this.montoPendiente - saldoUsable;

    this.form.patchValue({
      montoConSaldoPersonal: saldoUsable,
      montoPagado: remainder,
    });
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
      // Create mode: mixed payment support
      const montoPagado = Number(formValue.montoPagado) || 0;
      const montoConSaldoPersonal = Number(formValue.montoConSaldoPersonal) || 0;

      const result: PagoCampamentoDialogResult = {
        mode: 'create',
        data: {
          montoPagado,
          montoConSaldoPersonal,
          medioPago: montoPagado > 0 ? (formValue.medioPago as MedioPago) : undefined,
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
