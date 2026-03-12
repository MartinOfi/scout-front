/**
 * Protagonistas Form Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take } from 'rxjs';

import { PersonasStateService } from '../../../services';
import { PersonasFormBuilder } from '../../../services/personas-form.builder';
import { EmptyStateComponent } from '../../../../../shared';
import { Protagonista, CreateProtagonistaDto, UpdatePersonaDto } from '../../../../../shared/models';
import { Rama, RAMAS } from '../../../../../shared/enums';

// Shared Form Components
import { FormFieldComponent } from '../../../../../shared/components/form/form-field/form-field.component';
import { TextFieldComponent } from '../../../../../shared/components/form/text-field/text-field.component';
import { SelectFieldComponent } from '../../../../../shared/components/form/select-field/select-field.component';
import { CheckboxFieldComponent } from '../../../../../shared/components/form/checkbox-field/checkbox-field.component';

@Component({
  selector: 'app-protagonistas-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EmptyStateComponent,
    FormFieldComponent,
    TextFieldComponent,
    SelectFieldComponent,
    CheckboxFieldComponent
  ],
  templateUrl: './protagonistas-form.component.html',
  styleUrls: ['./protagonistas-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtagonistasFormComponent implements OnInit {
  private readonly state = inject(PersonasStateService);
  private readonly formBuilder = inject(PersonasFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  form: FormGroup = this.formBuilder.buildCreateProtagonistaForm();
  isEditing = false;
  editId: string | null = null;
  readonly ramas = [...RAMAS];

  readonly loading: Signal<boolean> = this.state.loading;
  readonly error: Signal<string | null> = this.state.error;
  readonly selected: Signal<Protagonista | null> = computed(() => {
    const s = this.state.selected();
    return s && s.tipo === 'protagonista' ? s as Protagonista : null;
  });

  ngOnInit(): void {
    this.route.params.pipe(
      take(1),
      filter(params => !!params['id'])
    ).subscribe(params => {
      this.isEditing = true;
      this.editId = params['id'];
      this.loadProtagonista(this.editId);
    });
  }

  private loadProtagonista(id: string | null): void {
    if (!id) return;
    const protagonista = this.state.protagonistas().find(p => p.id === id);
    if (protagonista) {
      this.form = this.formBuilder.buildEditProtagonistaForm(protagonista);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    if (this.isEditing && this.editId) {
      const dto: UpdatePersonaDto = this.formBuilder.extractUpdateProtagonistaDto(this.form);
      this.state.update(this.editId, dto).subscribe({
        next: () => this.router.navigate(['/personas/protagonistas'])
      });
    } else {
      const dto: CreateProtagonistaDto = this.formBuilder.extractCreateProtagonistaDto(this.form);
      this.state.createProtagonista(dto).subscribe({
        next: () => this.router.navigate(['/personas/protagonistas'])
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/personas/protagonistas']);
  }
}
