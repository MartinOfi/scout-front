/**
 * Movimiento Filters Component
 * Dumb Component - max 100 líneas
 * Filtros para movimientos
 * SIN any - tipado estricto
 */

import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { 
  TipoMovimientoEnum, 
  ConceptoMovimiento,
  CONCEPTO_MOVIMIENTO_LABELS 
} from '../../../../../../shared/enums';
import { MovimientosFilters } from '../../../../../../shared/models';

@Component({
  selector: 'app-movimiento-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './movimiento-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovimientoFiltersComponent {
  readonly filterChange = output<MovimientosFilters>();
  readonly clearFilters = output<void>();

  readonly conceptos = Object.values(ConceptoMovimiento);
  readonly conceptoLabels = CONCEPTO_MOVIMIENTO_LABELS;
  readonly tipos = Object.values(TipoMovimientoEnum);

  filterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      tipo: [null],
      concepto: [null],
      fechaInicio: [null],
      fechaFin: [null]
    });
  }

  onFilterChange(): void {
    const rawValue = this.filterForm.value;
    const filters: MovimientosFilters = {};
    
    if (rawValue.tipo) filters.tipo = rawValue.tipo;
    if (rawValue.concepto) filters.concepto = rawValue.concepto;
    if (rawValue.fechaInicio) filters.fechaInicio = rawValue.fechaInicio.toISOString();
    if (rawValue.fechaFin) filters.fechaFin = rawValue.fechaFin.toISOString();
    
    this.filterChange.emit(filters);
  }

  onClear(): void {
    this.filterForm.reset();
    this.clearFilters.emit();
  }
}
