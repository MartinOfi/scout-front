/**
 * Inscripcion Form Component
 * Smart Component - max 200 lineas
 * SIN any - tipado estricto
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { InscripcionesStateService } from '../../services/inscripciones-state.service';
import { PersonasStateService } from '../../../personas/services/personas-state.service';
import { CreateInscripcionDto, UpdateInscripcionDto, Inscripcion, PersonaUnion } from '../../../../shared/models';
import { TipoInscripcion, TIPO_INSCRIPCION_LABELS } from '../../../../shared/enums';
import { ConfiguracionService } from '../../../../shared/services';

// Shared Form Components
import { FormFieldComponent } from '../../../../shared/components/form/form-field/form-field.component';
import { SelectFieldComponent } from '../../../../shared/components/form/select-field/select-field.component';
import { NumberFieldComponent } from '../../../../shared/components/form/number-field/number-field.component';
import { CheckboxFieldComponent } from '../../../../shared/components/form/checkbox-field/checkbox-field.component';

interface TipoOption {
  value: TipoInscripcion;
  label: string;
}

@Component({
  selector: 'app-inscripcion-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldComponent,
    SelectFieldComponent,
    NumberFieldComponent,
    CheckboxFieldComponent
  ],
  templateUrl: './inscripcion-form.component.html',
  styleUrls: ['./inscripcion-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InscripcionFormComponent implements OnInit, OnDestroy {
  private readonly state: InscripcionesStateService = inject(InscripcionesStateService);
  private readonly personasState: PersonasStateService = inject(PersonasStateService);
  private readonly configService = inject(ConfiguracionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.state.loading;
  readonly personasLoading = this.personasState.loading;
  readonly personas: Signal<PersonaUnion[]> = this.personasState.allPersonas;
  readonly tipoLabels = TIPO_INSCRIPCION_LABELS;
  readonly tipos: TipoInscripcion[] = ['grupo', 'scout_argentina'];

  /** Options for tipo select */
  readonly tiposOptions: TipoOption[] = this.tipos.map(tipo => ({
    value: tipo,
    label: TIPO_INSCRIPCION_LABELS[tipo]
  }));

  /** Track current tipo for conditional rendering */
  private readonly currentTipo = signal<TipoInscripcion>('scout_argentina');

  /** Show authorization fields only for scout_argentina inscriptions */
  readonly showAuthorizationFields: Signal<boolean> = computed(() => {
    return this.currentTipo() === 'scout_argentina';
  });

  private tipoSubscription: Subscription | null = null;

  inscripcionForm: FormGroup = this.fb.group({
    personaId: ['', Validators.required],
    tipo: ['scout_argentina' as TipoInscripcion, Validators.required],
    ano: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
    montoTotal: [0, [Validators.required, Validators.min(0)]],
    montoBonificado: [0, [Validators.min(0)]],
    montoPagado: [0, [Validators.min(0)]],
    declaracionDeSalud: [false],
    autorizacionDeImagen: [false],
    salidasCercanas: [false],
    autorizacionIngreso: [false],
  });

  isEditing = false;
  inscripcionId: string | null = null;

  // Arrow functions for select field callbacks
  getPersonaId = (persona: PersonaUnion): string => persona.id;
  formatPersonaForSelect = (persona: PersonaUnion): string => persona.nombre;
  getTipoValue = (option: TipoOption): TipoInscripcion => option.value;
  getTipoLabel = (option: TipoOption): string => option.label;

  ngOnInit(): void {
    this.inscripcionId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.inscripcionId;

    // Load personas for the selector if not already loaded
    if (this.personasState.allPersonas().length === 0) {
      this.personasState.load();
    }

    // Listen to tipo changes to update authorization fields visibility
    this.tipoSubscription = this.inscripcionForm.get('tipo')?.valueChanges.subscribe(
      (tipo: TipoInscripcion) => {
        this.currentTipo.set(tipo);
        // Clear authorization fields when switching to grupo
        if (tipo === 'grupo') {
          this.inscripcionForm.patchValue({
            declaracionDeSalud: false,
            autorizacionDeImagen: false,
            salidasCercanas: false,
            autorizacionIngreso: false,
          });
        }
        // Auto-fill monto from config when not editing
        if (!this.isEditing) {
          this.inscripcionForm.get('montoTotal')?.setValue(this.configService.getMontoByTipo(tipo));
        }
      }
    ) ?? null;

    if (this.isEditing && this.inscripcionId) {
      this.loadInscripcion(this.inscripcionId);
    } else {
      // Set initial monto based on default tipo for new inscriptions
      this.setMontoFromConfig();
    }
  }

  /**
   * Set montoTotal from config based on current tipo
   */
  private setMontoFromConfig(): void {
    const tipo = this.inscripcionForm.get('tipo')?.value as TipoInscripcion;
    const monto = this.configService.getMontoByTipo(tipo);
    this.inscripcionForm.get('montoTotal')?.setValue(monto);
  }

  /** Format persona for display in selector */
  formatPersona(persona: PersonaUnion): string {
    return persona.nombre;
  }

  ngOnDestroy(): void {
    this.tipoSubscription?.unsubscribe();
  }

  private loadInscripcion(id: string): void {
    const inscripcion: Inscripcion | undefined = this.state.inscripciones().find((i: Inscripcion) => i.id === id);
    if (inscripcion) {
      // Update currentTipo for conditional rendering
      this.currentTipo.set(inscripcion.tipo);
      // In edit mode, only allow editing authorization fields and bonificacion
      this.inscripcionForm.patchValue({
        personaId: inscripcion.personaId,
        tipo: inscripcion.tipo,
        ano: inscripcion.ano,
        montoTotal: inscripcion.montoTotal,
        montoBonificado: inscripcion.montoBonificado,
        declaracionDeSalud: inscripcion.declaracionDeSalud,
        autorizacionDeImagen: inscripcion.autorizacionDeImagen,
        salidasCercanas: inscripcion.salidasCercanas,
        autorizacionIngreso: inscripcion.autorizacionIngreso,
      });
      // Disable fields that can't be edited
      this.inscripcionForm.get('personaId')?.disable();
      this.inscripcionForm.get('tipo')?.disable();
      this.inscripcionForm.get('ano')?.disable();
      this.inscripcionForm.get('montoTotal')?.disable();
    }
  }

  onSubmit(): void {
    if (this.inscripcionForm.invalid) {
      return;
    }

    const formValue = this.inscripcionForm.getRawValue();

    if (this.isEditing && this.inscripcionId) {
      const updateDto: UpdateInscripcionDto = {
        montoBonificado: formValue.montoBonificado,
        declaracionDeSalud: formValue.declaracionDeSalud,
        autorizacionDeImagen: formValue.autorizacionDeImagen,
        salidasCercanas: formValue.salidasCercanas,
        autorizacionIngreso: formValue.autorizacionIngreso,
      };
      this.state.update(this.inscripcionId, updateDto).subscribe(() => {
        this.router.navigate(['/inscripciones']);
      });
    } else {
      const dto: CreateInscripcionDto = {
        personaId: formValue.personaId,
        tipo: formValue.tipo,
        ano: formValue.ano,
        montoTotal: formValue.montoTotal,
        montoBonificado: formValue.montoBonificado || undefined,
        montoPagado: formValue.montoPagado || undefined,
        declaracionDeSalud: formValue.declaracionDeSalud || undefined,
        autorizacionDeImagen: formValue.autorizacionDeImagen || undefined,
        salidasCercanas: formValue.salidasCercanas || undefined,
        autorizacionIngreso: formValue.autorizacionIngreso || undefined,
      };
      this.state.create(dto).subscribe(() => {
        this.router.navigate(['/inscripciones']);
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/inscripciones']);
  }
}
