/**
 * Pago Cuota Dialog Component
 * Dialog for registering payments on cuotas (monthly group fees)
 */

import { Component, Inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { MedioPago, MedioPagoEnum, MEDIO_PAGO_LABELS } from '../../../../../shared/enums';

// Shared Form Components
import { FormFieldComponent } from '../../../../../shared/components/form/form-field/form-field.component';
import { NumberFieldComponent } from '../../../../../shared/components/form/number-field/number-field.component';
import { SelectFieldComponent } from '../../../../../shared/components/form/select-field/select-field.component';
import { TextareaFieldComponent } from '../../../../../shared/components/form/textarea-field/textarea-field.component';

/**
 * Data passed to the dialog
 */
export interface PagoCuotaDialogData {
  cuotaId: string;
  personaNombre: string;
  cuotaNombre: string;
  ano: number;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  saldoCuentaPersonal?: number;
  responsableId: string;
}

/**
 * Form data returned by the dialog
 */
export interface PagoCuotaCreateData {
  monto: number;
  medioPago: MedioPago;
  responsableId: string;
  descripcion?: string;
}

/**
 * Dialog result type
 */
export interface PagoCuotaDialogResult {
  mode: 'create';
  data: PagoCuotaCreateData;
}

interface MedioPagoOption {
  value: MedioPago;
  label: string;
}

@Component({
  selector: 'app-pago-cuota-dialog',
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
  templateUrl: './pago-cuota-dialog.component.html',
  styleUrl: './pago-cuota-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagoCuotaDialogComponent implements OnInit {
  form!: FormGroup;

  readonly mediosPagoOptions: MedioPagoOption[] = [
    { value: 'efectivo', label: MEDIO_PAGO_LABELS['efectivo'] },
    { value: 'transferencia', label: MEDIO_PAGO_LABELS['transferencia'] },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<PagoCuotaDialogComponent, PagoCuotaDialogResult>,
    @Inject(MAT_DIALOG_DATA) public readonly data: PagoCuotaDialogData,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      monto: [0, [Validators.required, Validators.min(1), Validators.max(this.data.montoPendiente)]],
      medioPago: [MedioPagoEnum.EFECTIVO, [Validators.required]],
      descripcion: [''],
    });
  }

  get montoPendiente(): number {
    return this.data.montoPendiente;
  }

  get saldoCuentaPersonal(): number {
    return this.data.saldoCuentaPersonal ?? 0;
  }

  get puedeUsarSaldo(): boolean {
    return this.saldoCuentaPersonal > 0;
  }

  get montoTotalPago(): number {
    return this.form.get('monto')?.value || 0;
  }

  get montoRestante(): number {
    return Math.max(0, this.montoPendiente - this.montoTotalPago);
  }

  get progressPercent(): number {
    const { montoTotal, montoPagado } = this.data;
    if (montoTotal <= 0) return 100;
    return Math.min(100, Math.round((montoPagado / montoTotal) * 100));
  }

  get formInvalid(): boolean {
    if (this.form.invalid) return true;

    const monto = this.form.get('monto')?.value || 0;
    if (monto <= 0) return true;
    if (monto > this.montoPendiente) return true;

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

    const result: PagoCuotaDialogResult = {
      mode: 'create',
      data: {
        monto: Number(formValue.monto),
        medioPago: formValue.medioPago as MedioPago,
        responsableId: this.data.responsableId,
        descripcion: formValue.descripcion || undefined,
      },
    };

    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
