/**
 * Concepto Selector Component
 * Dumb Component - max 80 líneas
 * Selector de concepto basado en tipo
 * SIN any - tipado estricto
 */

import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { 
  ConceptoMovimiento, 
  TipoMovimientoEnum,
  CONCEPTO_MOVIMIENTO_LABELS 
} from '../../../../../../shared/enums';

@Component({
  selector: 'app-concepto-selector',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './concepto-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConceptoSelectorComponent {
  readonly tipo = input<TipoMovimientoEnum | null>(null);
  readonly selected = input<string>('');
  readonly conceptoChange = output<string>();

  readonly conceptoLabels = CONCEPTO_MOVIMIENTO_LABELS;

  readonly conceptosFiltrados = computed((): ConceptoMovimiento[] => {
    const tipo = this.tipo();
    const todos = Object.values(ConceptoMovimiento);
    
    if (!tipo) return todos;
    
    return todos.filter(c => {
      const esIngreso = tipo === TipoMovimientoEnum.INGRESO;
      const conceptoIngreso = [
        ConceptoMovimiento.INSCRIPCION,
        ConceptoMovimiento.CUOTA_GRUPO,
        ConceptoMovimiento.CAMPAMENTO_PAGO,
        ConceptoMovimiento.EVENTO_VENTA_INGRESO,
        ConceptoMovimiento.EVENTO_GRUPO_INGRESO,
        ConceptoMovimiento.AJUSTE_INICIAL,
      ].includes(c);
      
      return esIngreso ? conceptoIngreso : !conceptoIngreso;
    });
  });
}
