/**
 * Evento Filters Component
 * Dumb Component - max 100 lineas
 */

import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TipoEvento, TIPO_EVENTO_LABELS } from '../../../../../shared/enums';

@Component({
  selector: 'app-evento-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './evento-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventoFiltersComponent {
  readonly filterChange = output<{ tipo: TipoEvento | 'todos'; busqueda: string }>();
  readonly tipoLabels = TIPO_EVENTO_LABELS;
  filterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      tipo: ['todos'],
      busqueda: ['']
    });
    this.filterForm.valueChanges.subscribe((v) =>
      this.filterChange.emit({ tipo: v.tipo, busqueda: v.busqueda })
    );
  }
}
