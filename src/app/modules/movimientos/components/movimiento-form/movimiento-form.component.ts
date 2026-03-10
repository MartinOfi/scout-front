/**
 * Movimiento Form Component
 * Smart Component - max 200 líneas
 * Formulario de creación/edición de movimientos
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { MovimientosStateService } from '../../services/movimientos-state.service';
import { CreateMovimientoDto } from '../../../../shared/models';
import { TipoMovimientoEnum, MedioPagoEnum, EstadoPago } from '../../../../shared/enums';

// Shared Form Components
import { FormFieldComponent } from '../../../../shared/components/form/form-field/form-field.component';
import { NumberFieldComponent } from '../../../../shared/components/form/number-field/number-field.component';
import { TextareaFieldComponent } from '../../../../shared/components/form/textarea-field/textarea-field.component';
import { SelectFieldComponent } from '../../../../shared/components/form/select-field/select-field.component';

// Dumb Component
import { ConceptoSelectorComponent } from './components/concepto-selector/concepto-selector.component';

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-movimiento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    FormFieldComponent,
    NumberFieldComponent,
    TextareaFieldComponent,
    SelectFieldComponent,
    ConceptoSelectorComponent
  ],
  templateUrl: './movimiento-form.component.html',
  styleUrls: ['./movimiento-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovimientoFormComponent implements OnInit {
  private readonly state = inject(MovimientosStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.state.loading;
  readonly isEditing = false;

  form: FormGroup;
  readonly tipos = Object.values(TipoMovimientoEnum);
  readonly mediosPago = Object.values(MedioPagoEnum);
  readonly estadosPago = Object.values(EstadoPago);

  // Options for select fields
  readonly tipoOptions: SelectOption[] = [
    { value: TipoMovimientoEnum.INGRESO, label: 'Ingreso' },
    { value: TipoMovimientoEnum.EGRESO, label: 'Egreso' }
  ];

  readonly medioPagoOptions: SelectOption[] = [
    { value: MedioPagoEnum.EFECTIVO, label: 'Efectivo' },
    { value: MedioPagoEnum.TRANSFERENCIA, label: 'Transferencia' }
  ];

  readonly estadoPagoOptions: SelectOption[] = [
    { value: EstadoPago.PAGADO, label: 'Pagado' },
    { value: EstadoPago.PENDIENTE_REEMBOLSO, label: 'Pendiente de Reembolso' }
  ];

  constructor() {
    this.form = this.fb.group({
      cajaId: ['', Validators.required],
      tipo: [TipoMovimientoEnum.INGRESO, Validators.required],
      monto: [0, [Validators.required, Validators.min(0.01)]],
      concepto: ['', Validators.required],
      descripcion: [''],
      responsableId: ['', Validators.required],
      medioPago: [MedioPagoEnum.EFECTIVO, Validators.required],
      requiereComprobante: [false],
      estadoPago: [EstadoPago.PAGADO, Validators.required],
      fecha: [new Date(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['cajaId']) {
        this.form.patchValue({ cajaId: params['cajaId'] });
      }
    });
  }

  onConceptoChange(concepto: string): void {
    this.form.patchValue({ concepto });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const rawValue = this.form.value;
    const dto: CreateMovimientoDto = {
      cajaId: rawValue.cajaId,
      tipo: rawValue.tipo,
      monto: rawValue.monto,
      concepto: rawValue.concepto,
      descripcion: rawValue.descripcion,
      responsableId: rawValue.responsableId,
      medioPago: rawValue.medioPago,
      requiereComprobante: rawValue.requiereComprobante,
      estadoPago: rawValue.estadoPago,
      fecha: rawValue.fecha.toISOString()
    };

    this.state.create(dto).subscribe({
      next: () => this.router.navigate(['/movimientos']),
      error: () => {}
    });
  }

  onCancel(): void {
    this.router.navigate(['/movimientos']);
  }
}
