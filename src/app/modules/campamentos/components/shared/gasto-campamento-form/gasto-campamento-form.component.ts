/**
 * Gasto Campamento Form Component
 * Dumb Component - max 120 líneas
 * SIN any - tipado estricto
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { MEDIOS_PAGO, MedioPago, EstadoPago } from '../../../../../shared/enums';
import { Persona } from '../../../../../shared/models';
import { positiveNumberValidator, decimalValidator, safeTextValidator } from '../../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-gasto-campamento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './gasto-campamento-form.component.html',
  styleUrl: './gasto-campamento-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GastoCampamentoFormComponent implements OnInit {
  @Input() responsables: Persona[] = [];

  @Output() submit = new EventEmitter<{
    monto: number;
    descripcion: string;
    responsableId: string;
    medioPago: MedioPago;
    estadoPago: EstadoPago;
  }>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  readonly mediosPago = MEDIOS_PAGO;
  readonly estadosPago = Object.values(EstadoPago);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      monto: [
        '',
        [
          Validators.required,
          positiveNumberValidator(),
          decimalValidator(2)
        ]
      ],
      descripcion: [
        '',
        [
          Validators.required,
          Validators.maxLength(500),
          safeTextValidator()
        ]
      ],
      responsableId: ['', [Validators.required]],
      medioPago: ['', [Validators.required]],
      estadoPago: [EstadoPago.PAGADO, [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submit.emit({
      monto: Number(this.form.value.monto),
      descripcion: this.form.value.descripcion as string,
      responsableId: this.form.value.responsableId as string,
      medioPago: this.form.value.medioPago as MedioPago,
      estadoPago: this.form.value.estadoPago as EstadoPago
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
