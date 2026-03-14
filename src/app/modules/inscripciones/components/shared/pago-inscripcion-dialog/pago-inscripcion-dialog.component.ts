/**
 * Pago Inscripcion Dialog Component
 * Dialog for registering subsequent payments on inscriptions
 */

import {
  Component,
  Inject,
  ChangeDetectionStrategy,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { MedioPago, MedioPagoEnum, MEDIO_PAGO_LABELS } from '../../../../../shared/enums';
import { ExistingPago } from '../../../../../shared/models';

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
  /** Edit mode: provide existing payment data */
  mode?: 'create' | 'edit';
  existingPago?: ExistingPago;
}

/**
 * Form data returned by the dialog (create mode)
 */
export interface PagoInscripcionFormData {
  montoPagado: number;
  montoConSaldoPersonal?: number;
  medioPago: MedioPago;
  descripcion?: string;
}

/**
 * Form data returned by the dialog (edit mode)
 */
export interface PagoInscripcionEditData {
  monto: number;
  medioPago: MedioPago;
  descripcion?: string;
}

/**
 * Union type for dialog result
 */
export type PagoInscripcionDialogResult =
  | { mode: 'create'; data: PagoInscripcionFormData }
  | { mode: 'edit'; data: PagoInscripcionEditData; movimientoId: string }
  | { mode: 'delete'; movimientoId: string };

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

  /** Signal to track if amounts exceed pending amount */
  readonly montosExcedenPendiente = signal(false);

  /** Computed: saldo restante después del pago */
  readonly saldoRestanteCalculado = signal(0);

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<
      PagoInscripcionDialogComponent,
      PagoInscripcionDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public readonly data: PagoInscripcionDialogData,
  ) {}

  ngOnInit(): void {
    if (this.isEditMode) {
      // Edit mode: single amount field with existing values
      const existing = this.data.existingPago!;
      this.form = this.fb.group({
        monto: [existing.monto, [Validators.required, Validators.min(1)]],
        medioPago: [existing.medioPago, [Validators.required]],
        descripcion: [existing.descripcion ?? ''],
      });
    } else {
      // Create mode: both payment types available
      this.form = this.fb.group({
        montoPagado: [0, [Validators.min(0)]],
        montoConSaldoPersonal: [0, [Validators.min(0)]],
        medioPago: [MedioPagoEnum.EFECTIVO, [Validators.required]],
        descripcion: [''],
      });

      // Subscribe to form changes to validate amounts
      this.form.valueChanges.subscribe(() => {
        this.validateMontos();
      });
    }
  }

  /**
   * Validate that montoPagado + montoConSaldoPersonal <= montoPendiente
   */
  private validateMontos(): void {
    const montoPagado = this.form.get('montoPagado')?.value || 0;
    const montoConSaldo = this.form.get('montoConSaldoPersonal')?.value || 0;
    const total = montoPagado + montoConSaldo;

    this.montosExcedenPendiente.set(total > this.montoPendiente);
    this.saldoRestanteCalculado.set(Math.max(0, this.montoPendiente - total));
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
    return this.saldoCuentaPersonal > 0;
  }

  get montoTotalPago(): number {
    if (this.isEditMode) {
      return this.form.get('monto')?.value || 0;
    }
    const montoPagado = this.form.get('montoPagado')?.value || 0;
    const montoConSaldo = this.form.get('montoConSaldoPersonal')?.value || 0;
    return montoPagado + montoConSaldo;
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

  get formInvalid(): boolean {
    if (this.form.invalid) return true;

    if (this.isEditMode) {
      const monto = this.form.get('monto')?.value || 0;
      if (monto <= 0) return true;
      if (monto > this.maxAllowedMonto) return true;
      return false;
    }

    // Create mode validation
    const montoPagado = this.form.get('montoPagado')?.value || 0;
    const montoConSaldo = this.form.get('montoConSaldoPersonal')?.value || 0;
    if (montoPagado <= 0 && montoConSaldo <= 0) return true;
    if (this.montosExcedenPendiente()) return true;
    return false;
  }

  /** Check if saldo personal exceeds available balance */
  get saldoExcedeDisponible(): boolean {
    const montoConSaldo = this.form?.get('montoConSaldoPersonal')?.value || 0;
    return montoConSaldo > this.saldoCuentaPersonal;
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

    if (this.isEditMode) {
      const result: PagoInscripcionDialogResult = {
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
      const result: PagoInscripcionDialogResult = {
        mode: 'create',
        data: {
          montoPagado: Number(formValue.montoPagado) || 0,
          montoConSaldoPersonal: Number(formValue.montoConSaldoPersonal) || undefined,
          medioPago: formValue.medioPago as MedioPago,
          descripcion: formValue.descripcion || undefined,
        },
      };
      this.dialogRef.close(result);
    }
  }

  onDelete(): void {
    if (!this.isEditMode || !this.data.existingPago) return;

    const result: PagoInscripcionDialogResult = {
      mode: 'delete',
      movimientoId: this.data.existingPago.movimientoId,
    };
    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
