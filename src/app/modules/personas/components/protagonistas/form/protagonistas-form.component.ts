/**
 * Protagonistas Form Component
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

import { PersonasStateService } from '../../../services';
import { PersonasFormBuilder } from '../../../services/personas-form.builder';
import { LoadingSpinnerComponent, EmptyStateComponent } from '../../../../../shared';
import { Protagonista, CreateProtagonistaDto, UpdatePersonaDto } from '../../../../../shared/models';
import { Rama } from '../../../../../shared/enums';

import { RamaSelectorComponent } from './components/rama-selector/rama-selector.component';

@Component({
  selector: 'app-protagonistas-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    RamaSelectorComponent
  ],
  templateUrl: './protagonistas-form.component.html',
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

  onRamaChange(rama: Rama): void {
    this.form.patchValue({ rama });
  }
}
