/**
 * Campamento Form Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';

import { CampamentosStateService, CampamentosFormBuilder } from '../../../services';
import { LoadingSpinnerComponent } from '../../../../../shared';

@Component({
  selector: 'app-campamento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './campamento-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampamentoFormComponent implements OnInit {
  // Services
  readonly state: CampamentosStateService = inject(CampamentosStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(CampamentosFormBuilder);

  // Form
  readonly form: FormGroup = this.formBuilder.buildCreateForm();
  readonly isEditing = signal(false);
  readonly loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.loadCampamento(id);
    }
  }

  loadCampamento(id: string): void {
    this.loading.set(true);
    // TODO: Cargar campamento por ID y poblar el form
    // this.state.selected (cargar por ID si no existe computed)
    this.loading.set(false);
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
        error: () => this.loading.set(false)
      });
    } else {
      this.state.create(dto).subscribe({
        next: (campamento) => this.router.navigate(['/campamentos', campamento.id]),
        error: () => this.loading.set(false)
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
