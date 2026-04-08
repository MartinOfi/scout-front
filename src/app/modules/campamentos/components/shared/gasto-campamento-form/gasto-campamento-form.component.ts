/**
 * Gasto Campamento Form Component
 * Dumb Component - max 120 líneas
 * SIN any - tipado estricto
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { MEDIO_PAGO_LABELS, MedioPago, EstadoPago } from '../../../../../shared/enums';
import { Persona } from '../../../../../shared/models';
import {
  positiveNumberValidator,
  decimalValidator,
  safeTextValidator,
} from '../../../../../shared/validators/custom-validators';

// Shared Form Components
import { FormFieldComponent } from '../../../../../shared/components/form/form-field/form-field.component';
import { NumberFieldComponent } from '../../../../../shared/components/form/number-field/number-field.component';
import { TextareaFieldComponent } from '../../../../../shared/components/form/textarea-field/textarea-field.component';
import { SelectFieldComponent } from '../../../../../shared/components/form/select-field/select-field.component';
import { DateFieldComponent } from '../../../../../shared/components/form/date-field/date-field.component';
import { FormActionsComponent } from '../../../../../shared/components/form/form-actions/form-actions.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

interface MedioPagoOption {
  value: MedioPago;
  label: string;
}

interface EstadoPagoOption {
  value: EstadoPago;
  label: string;
}

export interface GastoFormValue {
  monto: number;
  descripcion: string;
  responsableId: string;
  medioPago: MedioPago;
  estadoPago: EstadoPago;
  fecha: string;
  personaAReembolsarId?: string;
}

@Component({
  selector: 'app-gasto-campamento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldComponent,
    NumberFieldComponent,
    TextareaFieldComponent,
    SelectFieldComponent,
    DateFieldComponent,
    FormActionsComponent,
    ButtonComponent,
  ],
  templateUrl: './gasto-campamento-form.component.html',
  styleUrl: './gasto-campamento-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GastoCampamentoFormComponent implements OnInit, OnDestroy {
  @Input() responsables: Persona[] = [];
  @Input() personasParaReembolsar: Persona[] = [];

  @Output() formSubmit = new EventEmitter<GastoFormValue>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  readonly mediosPago: MedioPagoOption[] = [
    { value: 'efectivo', label: MEDIO_PAGO_LABELS['efectivo'] },
    { value: 'transferencia', label: MEDIO_PAGO_LABELS['transferencia'] },
  ];

  readonly estadosPago: EstadoPagoOption[] = [
    { value: EstadoPago.PAGADO, label: 'Pagado' },
    { value: EstadoPago.PENDIENTE_REEMBOLSO, label: 'Pendiente de Reembolso' },
  ];

  readonly EstadoPago = EstadoPago;

  private readonly destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const today = this.getTodayISO();

    this.form = this.fb.group({
      monto: ['', [Validators.required, positiveNumberValidator(), decimalValidator(2)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500), safeTextValidator()]],
      responsableId: ['', [Validators.required]],
      medioPago: ['', [Validators.required]],
      estadoPago: [EstadoPago.PAGADO, [Validators.required]],
      fecha: [today, [Validators.required]],
      personaAReembolsarId: [''],
    });

    this.form
      .get('estadoPago')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((estado: EstadoPago) => {
        const ctrl = this.form.get('personaAReembolsarId')!;
        if (estado === EstadoPago.PENDIENTE_REEMBOLSO) {
          ctrl.setValidators([Validators.required]);
        } else {
          ctrl.clearValidators();
          ctrl.setValue('');
        }
        ctrl.updateValueAndValidity();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isPendienteReembolso(): boolean {
    return this.form.get('estadoPago')?.value === EstadoPago.PENDIENTE_REEMBOLSO;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    this.formSubmit.emit({
      monto: Number(val.monto),
      descripcion: val.descripcion as string,
      responsableId: val.responsableId as string,
      medioPago: val.medioPago as MedioPago,
      estadoPago: val.estadoPago as EstadoPago,
      fecha: val.fecha as string,
      personaAReembolsarId: this.isPendienteReembolso
        ? (val.personaAReembolsarId as string)
        : undefined,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private getTodayISO(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
