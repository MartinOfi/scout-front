/**
 * Pago Inscripcion Dialog Component
 * Dialog for registering subsequent payments on inscriptions
 */

import { Component, Inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { MedioPago, MedioPagoEnum, MEDIO_PAGO_LABELS } from '../../../../../shared/enums';
import { positiveNumberValidator } from '../../../../../shared/validators/custom-validators';

// Shared Form Components
import { FormFieldComponent } from '../../../../../shared/components/form/form-field/form-field.component';
import { NumberFieldComponent } from '../../../../../shared/components/form/number-field/number-field.component';
import { SelectFieldComponent } from '../../../../../shared/components/form/select-field/select-field.component';
import { TextareaFieldComponent } from '../../../../../shared/components/form/textarea-field/textarea-field.component';

/**
 * Data passed to the dialog
 */
export interface PagoInscripcionDialogData {
  inscripcionId: string;
  montoPendiente: number;
  saldoCuentaPersonal?: number;
}

/**
 * Form data returned by the dialog
 */
export interface PagoInscripcionFormData {
  montoPagado: number;
  montoConSaldoPersonal?: number;
  medioPago: MedioPago;
  descripcion?: string;
}

interface MedioPagoOption {
  value: MedioPago;
  label: string;
}

@Component({
  selector: 'app-pago-inscripcion-dialog',
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
  templateUrl: './pago-inscripcion-dialog.component.html',
  styleUrl: './pago-inscripcion-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagoInscripcionDialogComponent implements OnInit {
  form!: FormGroup;

  readonly mediosPagoOptions: MedioPagoOption[] = [
    { value: 'efectivo', label: MEDIO_PAGO_LABELS['efectivo'] },
    { value: 'transferencia', label: MEDIO_PAGO_LABELS['transferencia'] },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<PagoInscripcionDialogComponent, PagoInscripcionFormData>,
    @Inject(MAT_DIALOG_DATA) public readonly data: PagoInscripcionDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      montoPagado: [
        0,
        [Validators.min(0), Validators.max(this.data.montoPendiente)],
      ],
      montoConSaldoPersonal: [0, [Validators.min(0)]],
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
    const montoPagado = this.form.get('montoPagado')?.value || 0;
    const montoConSaldo = this.form.get('montoConSaldoPersonal')?.value || 0;
    return montoPagado + montoConSaldo;
  }

  get montoRestante(): number {
    return Math.max(0, this.montoPendiente - this.montoTotalPago);
  }

  get formInvalid(): boolean {
    if (this.form.invalid) return true;
    // At least one payment amount must be > 0
    const montoPagado = this.form.get('montoPagado')?.value || 0;
    const montoConSaldo = this.form.get('montoConSaldoPersonal')?.value || 0;
    if (montoPagado <= 0 && montoConSaldo <= 0) return true;
    // Total payment cannot exceed pending amount
    if (this.montoTotalPago > this.montoPendiente) return true;
    return false;
  }

  // Callbacks for select field
  getMedioPagoValue = (option: MedioPagoOption): MedioPago => option.value;
  getMedioPagoLabel = (option: MedioPagoOption): string => option.label;

  usarSaldoDisponible(): void {
    const montoAUsar = Math.min(this.saldoCuentaPersonal, this.montoPendiente);
    this.form.patchValue({
      montoConSaldoPersonal: montoAUsar,
      montoPagado: 0,
    });
  }

  onSubmit(): void {
    if (this.formInvalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const result: PagoInscripcionFormData = {
      montoPagado: Number(formValue.montoPagado) || 0,
      montoConSaldoPersonal: Number(formValue.montoConSaldoPersonal) || undefined,
      medioPago: formValue.medioPago as MedioPago,
      descripcion: formValue.descripcion || undefined,
    };

    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
