/**
 * Personas Externas Filters Component
 * Dumb Component - max 80 líneas
 */

import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-personas-externas-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './personas-externas-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonasExternasFiltersComponent {
  readonly filterChange = output<{ search: string }>();
  filterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({ search: [''] });
    this.filterForm.valueChanges.subscribe(v => this.filterChange.emit(v));
  }
}
