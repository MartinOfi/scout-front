/**
 * Personas Externas Form Component
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
import { filter, take } from 'rxjs';

import { PersonasExternasStateService } from '../../../services';
import { PersonasFormBuilder } from '../../../services/personas-form.builder';
import { LoadingSpinnerComponent, EmptyStateComponent } from '../../../../../shared';
import { PersonaExterna, CreatePersonaExternaDto, UpdatePersonaDto } from '../../../../../shared/models';

@Component({
  selector: 'app-personas-externas-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
    LoadingSpinnerComponent, EmptyStateComponent
  ],
  templateUrl: './personas-externas-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonasExternasFormComponent implements OnInit {
  private readonly state = inject(PersonasExternasStateService);
  private readonly formBuilder = inject(PersonasFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  form: FormGroup = this.formBuilder.buildCreatePersonaExternaForm();
  isEditing = false;
  editId: string | null = null;

  readonly loading: Signal<boolean> = this.state.loading;
  readonly error: Signal<string | null> = this.state.error;
  readonly selected: Signal<PersonaExterna | null> = computed(() => this.state.selected());

  ngOnInit(): void {
    this.route.params.pipe(take(1), filter(params => !!params['id'])).subscribe(params => {
      this.isEditing = true;
      this.editId = params['id'];
      this.loadPersonaExterna(this.editId);
    });
  }

  private loadPersonaExterna(id: string | null): void {
    if (!id) return;
    const persona = this.state.personasExternas().find(p => p.id === id);
    if (persona) {
      this.form = this.formBuilder.buildEditPersonaExternaForm(persona);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    if (this.isEditing && this.editId) {
      const dto: UpdatePersonaDto = this.formBuilder.extractUpdatePersonaExternaDto(this.form);
      this.state.update(this.editId, dto).subscribe({ next: () => this.router.navigate(['/personas/personas-externas']) });
    } else {
      const dto: CreatePersonaExternaDto = this.formBuilder.extractCreatePersonaExternaDto(this.form);
      this.state.create(dto).subscribe({ next: () => this.router.navigate(['/personas/personas-externas']) });
    }
  }

  onCancel(): void {
    this.router.navigate(['/personas/personas-externas']);
  }
}
