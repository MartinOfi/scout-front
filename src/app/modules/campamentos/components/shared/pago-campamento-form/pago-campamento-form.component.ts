/**
 * Pago Campamento Form Component
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
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { MEDIOS_PAGO, MedioPago, MedioPagoEnum } from '../../../../../shared/enums';
import { positiveNumberValidator, decimalValidator } from '../../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-pago-campamento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './pago-campamento-form.component.html',
  styleUrl: './pago-campamento-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagoCampamentoFormComponent implements OnInit {
  @Input({ required: true }) montoTotal!: number;
  @Input() saldoCuentaPersonal: number = 0;

  @Output() submit = new EventEmitter<{
    monto: number;
    medioPago: MedioPago;
  }>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  readonly mediosPago = MEDIOS_PAGO;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      monto: [
        '',
        [
          Validators.required,
          positiveNumberValidator(),
          decimalValidator(2),
          Validators.max(this.montoTotal)
        ]
      ],
      medioPago: ['', [Validators.required]]
    });
  }

  get montoRestante(): number {
    const montoIngresado = this.form.get('monto')?.value || 0;
    return Math.max(0, this.montoTotal - montoIngresado);
  }

  get puedeUsarCuenta(): boolean {
    return this.saldoCuentaPersonal > 0;
  }

  usarSaldoDisponible(): void {
    const montoAUsar = Math.min(this.saldoCuentaPersonal, this.montoTotal);
    this.form.patchValue({
      monto: montoAUsar,
      medioPago: MedioPagoEnum.EFECTIVO
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submit.emit({
      monto: Number(this.form.value.monto),
      medioPago: this.form.value.medioPago as MedioPago
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
