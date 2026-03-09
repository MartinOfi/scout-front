/**
 * Protagonista Filters Component
 * Dumb Component - max 100 líneas
 */

import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Rama, RAMAS } from '../../../../../../../shared/enums';

@Component({
  selector: 'app-protagonista-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './protagonista-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtagonistaFiltersComponent {
  readonly filterChange = output<{ search: string; rama: Rama | null }>();
  
  ramas = RAMAS;
  filterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      search: [''],
      rama: [null]
    });

    this.filterForm.valueChanges.subscribe(value => {
      this.filterChange.emit(value);
    });
  }
}
