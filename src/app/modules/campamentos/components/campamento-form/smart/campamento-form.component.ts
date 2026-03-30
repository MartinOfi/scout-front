/**
 * Campamento Form Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { CampamentosStateService, CampamentosFormBuilder } from '../../../services';

// Shared Form Components
import { FormFieldComponent } from '../../../../../shared/components/form/form-field/form-field.component';
import { TextFieldComponent } from '../../../../../shared/components/form/text-field/text-field.component';
import { NumberFieldComponent } from '../../../../../shared/components/form/number-field/number-field.component';
import { TextareaFieldComponent } from '../../../../../shared/components/form/textarea-field/textarea-field.component';
import { DateFieldComponent } from '../../../../../shared/components/form/date-field/date-field.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-campamento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    FormFieldComponent,
    TextFieldComponent,
    NumberFieldComponent,
    TextareaFieldComponent,
    DateFieldComponent,
    ButtonComponent,
  ],
  templateUrl: './campamento-form.component.html',
  styleUrl: './campamento-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampamentoFormComponent implements OnInit {
  readonly state: CampamentosStateService = inject(CampamentosStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(CampamentosFormBuilder);

  readonly form: FormGroup = this.formBuilder.buildCreateForm();
  readonly isEditing = signal(false);
  readonly loading = signal(false);
  readonly loadingData = computed(() => this.state.loading() && this.isEditing());

  private formPopulated = false;

  constructor() {
    // React to selected campamento changes and populate form
    effect(() => {
      const campamento = this.state.selected();
      if (campamento && this.isEditing() && !this.formPopulated) {
        this.form.patchValue({
          nombre: campamento.nombre,
          fechaInicio: campamento.fechaInicio,
          fechaFin: campamento.fechaFin,
          costoPorPersona: campamento.costoPorPersona,
          cuotasBase: campamento.cuotasBase ?? 1,
          descripcion: campamento.descripcion ?? '',
        });
        this.formPopulated = true;
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.state.loadById(id);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const dto = this.formBuilder.extractCreateDto(this.form);

    if (this.isEditing()) {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) return;

      this.state.update(id, dto).subscribe({
        next: () => this.router.navigate(['/campamentos', id]),
        error: () => this.loading.set(false),
      });
    } else {
      this.state.create(dto).subscribe({
        next: (campamento) => this.router.navigate(['/campamentos', campamento.id]),
        error: () => this.loading.set(false),
      });
    }
  }

  onCancel(): void {
    if (this.isEditing()) {
      const id = this.route.snapshot.paramMap.get('id');
      this.router.navigate(['/campamentos', id]);
    } else {
      this.router.navigate(['/campamentos']);
    }
  }
}
