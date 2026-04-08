/**
 * Cerrar Evento Dialog Component
 * Select medioPago → calls state.cerrarEvento()
 * Only shown for VENTA tipo eventos.
 */

import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { EventoKpis, CerrarEventoVentaDto } from '../../../../../shared/models';
import { MedioPagoEnum, MEDIO_PAGO_LABELS } from '../../../../../shared/enums';
import { SelectFieldComponent } from '../../../../../shared/components/form/select-field/select-field.component';
import { FormFieldComponent } from '../../../../../shared/components/form/form-field/form-field.component';

export interface CerrarEventoDialogData {
  eventoId: string;
  nombreEvento: string;
  kpis: EventoKpis | null;
}

export interface CerrarEventoDialogResult {
  dto: CerrarEventoVentaDto;
}

interface MedioPagoOption {
  value: MedioPagoEnum;
  label: string;
}

@Component({
  selector: 'app-cerrar-evento-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    CurrencyPipe,
    SelectFieldComponent,
    FormFieldComponent,
  ],
  templateUrl: './cerrar-evento-dialog.component.html',
  styleUrl: './cerrar-evento-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CerrarEventoDialogComponent {
  readonly medioPagoOptions: MedioPagoOption[] = Object.values(MedioPagoEnum).map((v) => ({
    value: v,
    label: MEDIO_PAGO_LABELS[v],
  }));

  readonly form: FormGroup;

  readonly getOptionValue = (o: MedioPagoOption): string => o.value;
  readonly getOptionLabel = (o: MedioPagoOption): string => o.label;

  constructor(
    private readonly dialogRef: MatDialogRef<CerrarEventoDialogComponent, CerrarEventoDialogResult>,
    @Inject(MAT_DIALOG_DATA) public readonly data: CerrarEventoDialogData,
    private readonly fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      medioPago: ['', Validators.required],
    });
  }

  onConfirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: CerrarEventoVentaDto = {
      medioPago: this.form.value.medioPago as MedioPagoEnum,
    };
    this.dialogRef.close({ dto });
  }

  onCancel(): void {
    this.dialogRef.close(undefined);
  }
}
