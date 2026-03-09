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
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MovimientosStateService } from '../../services/movimientos-state.service';
import { CajasStateService } from '../../../cajas/services/cajas-state.service';
import { CreateMovimientoDto, Movimiento } from '../../../../shared/models';
import { 
  TipoMovimientoEnum, 
  MedioPagoEnum,
  EstadoPago 
} from '../../../../shared/enums';

// Dumb Component
import { ConceptoSelectorComponent } from './components/concepto-selector/concepto-selector.component';

@Component({
  selector: 'app-movimiento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    ConceptoSelectorComponent
  ],
  templateUrl: './movimiento-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovimientoFormComponent implements OnInit {
  private readonly state = inject(MovimientosStateService);
  private readonly cajasState = inject(CajasStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.state.loading;
  readonly isEditing = false;

  form: FormGroup;
  readonly tipos = Object.values(TipoMovimientoEnum);
  readonly mediosPago = Object.values(MedioPagoEnum);
  readonly estadosPago = Object.values(EstadoPago);

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
    // Leer query params para pre-llenar caja
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
      error: () => {} // Error ya manejado en el state
    });
  }

  onCancel(): void {
    this.router.navigate(['/movimientos']);
  }
}
