import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FILTER_LABELS } from '../../config/filter-labels.config';

/**
 * Dumb button que abre el popover de filtros.
 *
 * - Muestra "Filtrar" cuando no hay filtros activos.
 * - Muestra solo el ícono `+` compacto cuando hay 1+ filtros aplicados.
 */
@Component({
  selector: 'app-filter-trigger-button',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-trigger-button.component.html',
  styleUrl: './filter-trigger-button.component.scss',
})
export class FilterTriggerButtonComponent {
  readonly activeCount = input.required<number>();
  readonly clicked = output<void>();

  protected readonly label = computed(() =>
    this.activeCount() > 0 ? '' : FILTER_LABELS.triggerButton,
  );

  protected readonly ariaLabel = FILTER_LABELS.openFiltersAria;

  protected onClick(): void {
    this.clicked.emit();
  }
}
