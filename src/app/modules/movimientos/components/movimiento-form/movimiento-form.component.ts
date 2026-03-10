/**
 * Movimiento Form Component
 * Smart Component - Formulario de creación/edición de movimientos
 * Soporta contexto de inscripción cuando viene de ese flujo
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { take } from 'rxjs';

import { MovimientosStateService } from '../../services/movimientos-state.service';
import { InscripcionesApiService } from '../../../inscripciones/services/inscripciones-api.service';
import { CajasApiService } from '../../../cajas/services/cajas-api.service';
import { CreateMovimientoDto, InscripcionConEstado, CajaConSaldo } from '../../../../shared/models';
import { TipoMovimientoEnum, MedioPagoEnum, EstadoPago, TIPO_INSCRIPCION_LABELS, ConceptoMovimiento } from '../../../../shared/enums';

// Shared Form Components
import { FormFieldComponent } from '../../../../shared/components/form/form-field/form-field.component';
import { NumberFieldComponent } from '../../../../shared/components/form/number-field/number-field.component';
import { TextareaFieldComponent } from '../../../../shared/components/form/textarea-field/textarea-field.component';
import { SelectFieldComponent } from '../../../../shared/components/form/select-field/select-field.component';
import { DateFieldComponent } from '../../../../shared/components/form/date-field/date-field.component';

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
    CurrencyPipe,
    ReactiveFormsModule,
    MatIconModule,
    MatSlideToggleModule,
    FormFieldComponent,
    NumberFieldComponent,
    TextareaFieldComponent,
    SelectFieldComponent,
    DateFieldComponent,
    ConceptoSelectorComponent
  ],
  templateUrl: './movimiento-form.component.html',
  styleUrls: ['./movimiento-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovimientoFormComponent implements OnInit {
  private readonly state = inject(MovimientosStateService);
  private readonly inscripcionesApi = inject(InscripcionesApiService);
  private readonly cajasApi = inject(CajasApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.state.loading;
  readonly isEditing = false;

  // Inscripción context (when paying for an inscription)
  readonly inscripcion = signal<InscripcionConEstado | null>(null);
  readonly loadingInscripcion = signal(false);
  readonly tipoInscripcionLabels = TIPO_INSCRIPCION_LABELS;

  // Caja de grupo (for inscription payments)
  readonly cajaGrupo = signal<CajaConSaldo | null>(null);


  // Computed values for inscripcion context
  readonly montoAPagar = computed(() => {
    const insc = this.inscripcion();
    if (!insc) return 0;
    return insc.montoTotal - insc.montoBonificado;
  });

  readonly progressPercent = computed(() => {
    const insc = this.inscripcion();
    if (!insc) return 0;
    const total = this.montoAPagar();
    if (total <= 0) return 100;
    return Math.min(100, Math.round((insc.montoPagado / total) * 100));
  });

  readonly progressClass = computed(() => {
    const insc = this.inscripcion();
    if (!insc) return 'progress--pending';
    if (insc.saldoPendiente === 0) return 'progress--success';
    if (insc.montoPagado > 0) return 'progress--partial';
    return 'progress--pending';
  });

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
      fecha: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      if (params['cajaId']) {
        this.form.patchValue({ cajaId: params['cajaId'] });
      }

      // Handle inscripcion context
      if (params['concepto'] === 'inscripcion' && params['referenciaId']) {
        this.loadInscripcionContext(params['referenciaId']);
      }
    });
  }

  private loadInscripcionContext(inscripcionId: string): void {
    this.loadingInscripcion.set(true);

    // Load inscription data
    this.inscripcionesApi.getById(inscripcionId).pipe(take(1)).subscribe({
      next: (insc) => {
        this.inscripcion.set(insc);
        this.loadingInscripcion.set(false);

        // Pre-fill form with inscription context
        this.form.patchValue({
          concepto: ConceptoMovimiento.INSCRIPCION_GRUPO,
          tipo: TipoMovimientoEnum.INGRESO,
          // Suggest the pending amount
          monto: insc.saldoPendiente > 0 ? insc.saldoPendiente : 0,
          descripcion: `Pago inscripción ${this.tipoInscripcionLabels[insc.tipo]} ${insc.ano}`,
          // The responsable is the persona from the inscription
          responsableId: insc.personaId
        });
      },
      error: () => {
        this.loadingInscripcion.set(false);
      }
    });

    // Load caja de grupo for inscription payments
    this.cajasApi.getCajaGrupo().pipe(take(1)).subscribe({
      next: (caja) => {
        this.cajaGrupo.set(caja);
        this.form.patchValue({ cajaId: caja.id });
      }
    });
  }

  onConceptoChange(concepto: string): void {
    this.form.patchValue({ concepto });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const rawValue = this.form.value;
    const insc = this.inscripcion();

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
      fecha: rawValue.fecha,
      // Include inscripcionId when paying for an inscription
      ...(insc ? { inscripcionId: insc.id } : {})
    };

    this.state.create(dto).subscribe({
      next: () => {
        // Navigate back to inscripcion detail if we came from there
        if (insc) {
          this.router.navigate(['/inscripciones', insc.id]);
        } else {
          this.router.navigate(['/movimientos']);
        }
      },
      error: () => { }
    });
  }

  onCancel(): void {
    const insc = this.inscripcion();
    if (insc) {
      this.router.navigate(['/inscripciones', insc.id]);
    } else {
      this.router.navigate(['/movimientos']);
    }
  }

  /** Fill monto with remaining balance */
  fillPendingAmount(): void {
    const insc = this.inscripcion();
    if (insc && insc.saldoPendiente > 0) {
      this.form.patchValue({ monto: insc.saldoPendiente });
    }
  }
}
