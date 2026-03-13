/**
 * Quick Movimiento Dialog Component
 * Dialog for registering movements directly from cajas page
 * SIN any - tipado estricto
 */

import { Component, Inject, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  TipoMovimientoEnum,
  MedioPagoEnum,
  EstadoPago,
  CajaType,
  CAJA_TYPE_LABELS,
} from '../../../../../shared/enums';
import { CreateMovimientoDto, CajaConSaldo } from '../../../../../shared/models';
import { PersonasApiService } from '../../../../personas/services/personas-api.service';

// Shared Form Components
import { NumberFieldComponent } from '../../../../../shared/components/form/number-field/number-field.component';
import { SelectFieldComponent } from '../../../../../shared/components/form/select-field/select-field.component';
import { TextareaFieldComponent } from '../../../../../shared/components/form/textarea-field/textarea-field.component';

// Concepto Selector
import { ConceptoSelectorComponent } from '../../../../movimientos/components/movimiento-form/components/concepto-selector/concepto-selector.component';

import {
  positiveNumberValidator,
  decimalValidator,
  safeTextValidator,
} from '../../../../../shared/validators/custom-validators';

/**
 * Data passed to the dialog
 */
export interface QuickMovimientoDialogData {
  caja: CajaConSaldo;
}

/**
 * Result returned by the dialog
 */
export interface QuickMovimientoDialogResult {
  dto: CreateMovimientoDto;
}

interface SelectOption {
  value: string;
  label: string;
}

interface PersonaOption {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-quick-movimiento-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NumberFieldComponent,
    SelectFieldComponent,
    TextareaFieldComponent,
    ConceptoSelectorComponent,
  ],
  templateUrl: './quick-movimiento-dialog.component.html',
  styleUrl: './quick-movimiento-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickMovimientoDialogComponent implements OnInit {
  form!: FormGroup;
  readonly loading = signal(true);
  readonly personas = signal<PersonaOption[]>([]);

  readonly tipoOptions: SelectOption[] = [
    { value: TipoMovimientoEnum.INGRESO, label: 'Ingreso' },
    { value: TipoMovimientoEnum.EGRESO, label: 'Egreso' },
  ];

  readonly medioPagoOptions: SelectOption[] = [
    { value: MedioPagoEnum.EFECTIVO, label: 'Efectivo' },
    { value: MedioPagoEnum.TRANSFERENCIA, label: 'Transferencia' },
  ];

  readonly estadoPagoOptions: SelectOption[] = [
    { value: EstadoPago.PAGADO, label: 'Pagado' },
    { value: EstadoPago.PENDIENTE_REEMBOLSO, label: 'Pendiente de Reembolso' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly personasApi: PersonasApiService,
    private readonly dialogRef: MatDialogRef<
      QuickMovimientoDialogComponent,
      QuickMovimientoDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public readonly data: QuickMovimientoDialogData,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadPersonas();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      tipo: [TipoMovimientoEnum.INGRESO, [Validators.required]],
      monto: ['', [Validators.required, positiveNumberValidator(), decimalValidator(2)]],
      concepto: ['', [Validators.required]],
      responsableId: ['', [Validators.required]],
      medioPago: [MedioPagoEnum.EFECTIVO, [Validators.required]],
      estadoPago: [EstadoPago.PAGADO, [Validators.required]],
      descripcion: ['', [Validators.maxLength(500), safeTextValidator()]],
    });
  }

  private loadPersonas(): void {
    this.personasApi.getAll().subscribe({
      next: (personas) => {
        const options: PersonaOption[] = personas.map((p) => ({
          id: p.id,
          nombre: p.nombre,
        }));
        this.personas.set(options);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  get cajaDisplayName(): string {
    const caja = this.data.caja;
    if (caja.nombre) {
      return caja.nombre;
    }
    return CAJA_TYPE_LABELS[caja.tipo] || `Caja ${caja.id.slice(0, 8)}`;
  }

  get selectedTipo(): TipoMovimientoEnum | null {
    return this.form.get('tipo')?.value || null;
  }

  get selectedConcepto(): string {
    return this.form.get('concepto')?.value || '';
  }

  onConceptoChange(concepto: string): void {
    this.form.patchValue({ concepto });
  }

  onTipoChange(): void {
    // Reset concepto when tipo changes
    this.form.patchValue({ concepto: '' });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;

    const dto: CreateMovimientoDto = {
      cajaId: this.data.caja.id,
      tipo: formValue.tipo,
      monto: Number(formValue.monto),
      concepto: formValue.concepto,
      responsableId: formValue.responsableId,
      medioPago: formValue.medioPago,
      estadoPago: formValue.estadoPago,
      descripcion: formValue.descripcion || undefined,
      requiereComprobante: false,
    };

    this.dialogRef.close({ dto });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
