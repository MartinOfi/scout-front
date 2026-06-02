import { Type } from '@angular/core';
import { ReporteEvento } from '../../../../shared/models';

/**
 * Descriptor de una sección del reporte. La página itera la lista que devuelve
 * la config para la variante y renderiza cada componente con NgComponentOutlet.
 * Agregar una variante = nueva entrada de config + (quizás) secciones nuevas;
 * las secciones existentes se reutilizan (Open/Closed).
 */
export interface ReporteSectionDescriptor {
  readonly key: string;
  readonly component: Type<unknown>;
  readonly inputs: (vm: ReporteEvento) => Record<string, unknown>;
}
