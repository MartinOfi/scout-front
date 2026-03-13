/**
 * Movimiento Form Component
 * Smart Component - Generic form for creating/editing movimientos
 * SIN any - tipado estricto
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { take, switchMap, of, tap, catchError, forkJoin } from 'rxjs';

import { MovimientosStateService } from '../../services/movimientos-state.service';
import { MovimientosApiService } from '../../services/movimientos-api.service';
import { MovimientosFormBuilder } from '../../services/movimientos-form.builder';
import { CajasApiService } from '../../../cajas/services/cajas-api.service';
import { PersonasApiService } from '../../../personas/services/personas-api.service';
import { TipoMovimientoEnum, MedioPagoEnum, EstadoPago, CajaType } from '../../../../shared/enums';
import { CajaConSaldo, PersonaUnion, Movimiento } from '../../../../shared/models';

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

interface CajaOption {
  id: string;
  nombre: string;
  tipo: CajaType;
  saldo: number;
}

interface PersonaOption {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-movimiento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSlideToggleModule,
    FormFieldComponent,
    NumberFieldComponent,
    TextareaFieldComponent,
    SelectFieldComponent,
    DateFieldComponent,
    ConceptoSelectorComponent,
  ],
  templateUrl: './movimiento-form.component.html',
  styleUrls: ['./movimiento-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovimientoFormComponent implements OnInit {
  private readonly state = inject(MovimientosStateService);
  private readonly movimientosApi = inject(MovimientosApiService);
  private readonly cajasApi = inject(CajasApiService);
  private readonly personasApi = inject(PersonasApiService);
  private readonly formBuilder = inject(MovimientosFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = this.state.loading;

  // Edit mode state
  readonly isEditing = signal(false);
  readonly movimientoId = signal<string | null>(null);
  readonly loadingData = signal(false);
  currentMovimiento: Movimiento | null = null;

  // Cajas and personas for selectors
  readonly cajas = signal<CajaOption[]>([]);
  readonly personas = signal<PersonaOption[]>([]);

  form!: FormGroup;
  readonly tipos = Object.values(TipoMovimientoEnum);
  readonly mediosPago = Object.values(MedioPagoEnum);
  readonly estadosPago = Object.values(EstadoPago);

  // Options for select fields
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

  ngOnInit(): void {
    this.loadingData.set(true);

    // Detect edit mode from route params
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // Edit mode
      this.isEditing.set(true);
      this.movimientoId.set(id);
      this.loadDataForEdit(id);
    } else {
      // Create mode
      this.setupCreateMode();
    }
  }

  /**
   * Load cajas, personas, and movimiento data for edit mode
   */
  private loadDataForEdit(id: string): void {
    forkJoin({
      cajas: this.cajasApi.getAll(),
      personas: this.personasApi.getAll(),
      movimiento: this.movimientosApi.getById(id),
    })
      .pipe(
        tap(({ cajas, personas, movimiento }) => {
          this.setCajaOptions(cajas);
          this.setPersonaOptions(personas);
          this.currentMovimiento = movimiento;

          // Build edit form with movimiento data
          this.form = this.formBuilder.buildEditForm(movimiento);
        }),
        catchError((error) => {
          console.error('Error loading data for edit:', error);
          this.router.navigate(['/movimientos']);
          return of(null);
        }),
      )
      .subscribe(() => {
        this.loadingData.set(false);
      });
  }

  /**
   * Setup create mode: load cajas and personas, build create form
   */
  private setupCreateMode(): void {
    // Build create form first
    this.form = this.formBuilder.buildCreateForm();

    // Set sensible defaults
    this.form.patchValue({
      tipo: TipoMovimientoEnum.INGRESO,
      medioPago: MedioPagoEnum.EFECTIVO,
      estadoPago: EstadoPago.PAGADO,
    });

    // Load cajas and personas in parallel
    forkJoin({
      cajas: this.cajasApi.getAll(),
      personas: this.personasApi.getAll(),
    })
      .pipe(
        tap(({ cajas, personas }) => {
          this.setCajaOptions(cajas);
          this.setPersonaOptions(personas);

          // Check for query params to pre-fill caja
          this.route.queryParams.pipe(take(1)).subscribe((params) => {
            if (params['cajaId']) {
              this.form.patchValue({ cajaId: params['cajaId'] });
            }
          });
        }),
        catchError((error) => {
          console.error('Error loading data:', error);
          return of(null);
        }),
      )
      .subscribe(() => {
        this.loadingData.set(false);
      });
  }

  /**
   * Transform cajas to select options
   */
  private setCajaOptions(cajas: CajaConSaldo[]): void {
    const options: CajaOption[] = cajas.map((caja) => ({
      id: caja.id,
      nombre: this.getCajaDisplayName(caja),
      tipo: caja.tipo,
      saldo: caja.saldoActual,
    }));
    this.cajas.set(options);
  }

  /**
   * Generate display name for caja
   */
  private getCajaDisplayName(caja: CajaConSaldo): string {
    if (caja.nombre) {
      return caja.nombre;
    }
    // Generate name based on type
    switch (caja.tipo) {
      case CajaType.GRUPO:
        return 'Caja del Grupo';
      case CajaType.RAMA_MANADA:
        return 'Fondo Manada';
      case CajaType.RAMA_UNIDAD:
        return 'Fondo Unidad';
      case CajaType.RAMA_CAMINANTES:
        return 'Fondo Caminantes';
      case CajaType.RAMA_ROVERS:
        return 'Fondo Rovers';
      case CajaType.PERSONAL:
        return caja.propietario ? `Cuenta de ${caja.propietario.nombre}` : 'Cuenta Personal';
      default:
        return `Caja ${caja.id.slice(0, 8)}`;
    }
  }

  /**
   * Transform personas to select options
   */
  private setPersonaOptions(personas: PersonaUnion[]): void {
    const options: PersonaOption[] = personas.map((p) => ({
      id: p.id,
      nombre: p.nombre,
    }));
    this.personas.set(options);
  }

  onConceptoChange(concepto: string): void {
    this.form.patchValue({ concepto });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    if (this.isEditing()) {
      // Update existing movimiento
      const dto = this.formBuilder.extractUpdateDto(this.form);
      const id = this.movimientoId();

      if (!id) return;

      this.state.update(id, dto).subscribe({
        next: () => {
          this.router.navigate(['/movimientos']);
        },
        error: () => {
          // Error handled by state service
        },
      });
    } else {
      // Create new movimiento
      const dto = this.formBuilder.extractCreateDto(this.form);

      this.state.create(dto).subscribe({
        next: () => {
          this.router.navigate(['/movimientos']);
        },
        error: () => {
          // Error handled by state service
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/movimientos']);
  }
}
