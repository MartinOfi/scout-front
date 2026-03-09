/**
 * Inscripcion Form Component
 * Smart Component - max 200 lineas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InscripcionesStateService } from '../../services/inscripciones-state.service';
import { CreateInscripcionDto, UpdateInscripcionDto, Inscripcion } from '../../../../shared/models';
import { TipoInscripcion, TIPO_INSCRIPCION_LABELS } from '../../../../shared/enums';

@Component({
  selector: 'app-inscripcion-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './inscripcion-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InscripcionFormComponent implements OnInit {
  private readonly state: InscripcionesStateService = inject(InscripcionesStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.state.loading;
  readonly tipoLabels = TIPO_INSCRIPCION_LABELS;
  readonly tipos: TipoInscripcion[] = ['grupo', 'scout_argentina'];

  inscripcionForm: FormGroup = this.fb.group({
    personaId: ['', Validators.required],
    tipo: ['scout_argentina' as TipoInscripcion, Validators.required],
    ano: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
    montoTotal: [0, [Validators.required, Validators.min(0)]],
    montoBonificado: [0, [Validators.min(0)]],
    declaracionDeSalud: [false],
    autorizacionDeImagen: [false],
    salidasCercanas: [false],
    autorizacionIngreso: [false],
  });

  isEditing = false;
  inscripcionId: string | null = null;

  ngOnInit(): void {
    this.inscripcionId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.inscripcionId;

    if (this.isEditing && this.inscripcionId) {
      this.loadInscripcion(this.inscripcionId);
    }
  }

  private loadInscripcion(id: string): void {
    const inscripcion: Inscripcion | undefined = this.state.inscripciones().find((i: Inscripcion) => i.id === id);
    if (inscripcion) {
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
