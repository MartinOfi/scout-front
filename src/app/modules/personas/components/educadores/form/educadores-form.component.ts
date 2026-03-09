/**
 * Educadores Form Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { filter, take } from 'rxjs';

import { EducadoresStateService } from '../../../services';
import { PersonasFormBuilder } from '../../../services/personas-form.builder';
import { LoadingSpinnerComponent, EmptyStateComponent } from '../../../../../shared';
import { Educador, CreateEducadorDto, UpdatePersonaDto } from '../../../../../shared/models';
import { Rama, RAMAS } from '../../../../../shared/enums';

@Component({
  selector: 'app-educadores-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatSelectModule,
    LoadingSpinnerComponent, EmptyStateComponent
  ],
  templateUrl: './educadores-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EducadoresFormComponent implements OnInit {
  private readonly state = inject(EducadoresStateService);
  private readonly formBuilder = inject(PersonasFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  form: FormGroup = this.formBuilder.buildCreateEducadorForm();
  isEditing = false;
  editId: string | null = null;
  readonly ramas = RAMAS;

  readonly loading: Signal<boolean> = this.state.loading;
  readonly error: Signal<string | null> = this.state.error;
  readonly selected: Signal<Educador | null> = computed(() => this.state.selected());

  ngOnInit(): void {
    this.route.params.pipe(take(1), filter(params => !!params['id'])).subscribe(params => {
      this.isEditing = true;
      this.editId = params['id'];
      this.loadEducador(this.editId);
    });
  }

  private loadEducador(id: string | null): void {
    if (!id) return;
    const educador = this.state.educadores().find(e => e.id === id);
    if (educador) {
      this.form = this.formBuilder.buildEditEducadorForm(educador);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    if (this.isEditing && this.editId) {
      const dto: UpdatePersonaDto = this.formBuilder.extractUpdateEducadorDto(this.form);
      this.state.update(this.editId, dto).subscribe({ next: () => this.router.navigate(['/personas/educadores']) });
    } else {
      const dto: CreateEducadorDto = this.formBuilder.extractCreateEducadorDto(this.form);
      this.state.create(dto).subscribe({ next: () => this.router.navigate(['/personas/educadores']) });
    }
  }

  onCancel(): void {
    this.router.navigate(['/personas/educadores']);
  }
}
