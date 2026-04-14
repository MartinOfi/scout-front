/**
 * Concepto Selector Component
 * Dumb Component - max 80 líneas
 * Selector de concepto basado en tipo
 * SIN any - tipado estricto
 */

import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ConceptoMovimiento,
  TipoMovimientoEnum,
  CONCEPTO_MOVIMIENTO_LABELS,
  CONCEPTOS_CREABLES_MANUALMENTE,
} from '../../../../../../shared/enums';

// Shared Form Components
import { FormFieldComponent } from '../../../../../../shared/components/form/form-field/form-field.component';

@Component({
  selector: 'app-concepto-selector',
  standalone: true,
  imports: [CommonModule, FormFieldComponent],
  templateUrl: './concepto-selector.component.html',
  styleUrls: ['./concepto-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConceptoSelectorComponent {
  readonly tipo = input<TipoMovimientoEnum | null>(null);
  readonly selected = input<string>('');
  readonly conceptoChange = output<string>();

  readonly conceptoLabels = CONCEPTO_MOVIMIENTO_LABELS;

  readonly conceptosFiltrados = computed((): ConceptoMovimiento[] => {
    const tipo = this.tipo();
    const manuales = [...CONCEPTOS_CREABLES_MANUALMENTE];

    if (!tipo) return manuales;

    const esIngreso = tipo === TipoMovimientoEnum.INGRESO;
    return manuales.filter((c) => {
      if (c === ConceptoMovimiento.GASTO_GENERAL) return !esIngreso;
      return true;
    });
  });

  onSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.conceptoChange.emit(select.value);
  }
}
