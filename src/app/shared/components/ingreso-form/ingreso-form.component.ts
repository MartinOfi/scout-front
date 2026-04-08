/**
 * Ingreso Form Component (Dumb / Shared)
 * Reusable ingreso registration form — no date, no module coupling
 * Max 100 líneas - SIN any
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Persona } from '../../models';
import { MEDIO_PAGO_LABELS, MedioPago } from '../../enums';
import {
  positiveNumberValidator,
  decimalValidator,
  safeTextValidator,
} from '../../validators/custom-validators';

import { FormFieldComponent } from '../form/form-field/form-field.component';
import { NumberFieldComponent } from '../form/number-field/number-field.component';
import { TextareaFieldComponent } from '../form/textarea-field/textarea-field.component';
import { SelectFieldComponent } from '../form/select-field/select-field.component';
import { FormActionsComponent } from '../form/form-actions/form-actions.component';
import { ButtonComponent } from '../button/button.component';

interface MedioPagoOption {
  value: MedioPago;
  label: string;
}

export interface IngresoFormValue {
  monto: number;
  descripcion: string;
  responsableId: string;
  medioPago: MedioPago;
}

@Component({
  selector: 'app-ingreso-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldComponent,
    NumberFieldComponent,
    TextareaFieldComponent,
    SelectFieldComponent,
    FormActionsComponent,
    ButtonComponent,
  ],
  templateUrl: './ingreso-form.component.html',
  styleUrl: './ingreso-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngresoFormComponent implements OnInit {
  @Input() responsables: Persona[] = [];

  @Output() formSubmit = new EventEmitter<IngresoFormValue>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  readonly mediosPago: MedioPagoOption[] = [
    { value: 'efectivo', label: MEDIO_PAGO_LABELS['efectivo'] },
    { value: 'transferencia', label: MEDIO_PAGO_LABELS['transferencia'] },
    { value: 'saldo_personal', label: MEDIO_PAGO_LABELS['saldo_personal'] },
    { value: 'mixto', label: MEDIO_PAGO_LABELS['mixto'] },
  ];

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      monto: ['', [Validators.required, positiveNumberValidator(), decimalValidator(2)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500), safeTextValidator()]],
      responsableId: ['', [Validators.required]],
      medioPago: ['', [Validators.required]],
    });
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
    });

    this.form.reset({ monto: '', descripcion: '', responsableId: '', medioPago: '' });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
