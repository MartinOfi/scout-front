import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { humanize } from '../../../../../pipes/humanize.pipe';
import { ActiveFilter } from '../../active-filter.interface';
import { DateRangeValue, FilterPrimitive, FilterValue } from '../../filter-value.type';

/**
 * Chip de solo lectura que muestra un filtro activo como `Label: Value`.
 *
 * - No es editable — toda modificación se hace desde el form panel del popover.
 * - El botón de cerrar aparece en hover.
 * - Emite `removed` al hacer click en la cruz.
 */
@Component({
  selector: 'app-active-filter-chip',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './active-filter-chip.component.html',
  styleUrl: './active-filter-chip.component.scss',
})
export class ActiveFilterChipComponent {
  readonly filter = input.required<ActiveFilter>();
  readonly removed = output<void>();

  protected readonly displayText = computed(() => {
    const current = this.filter();
    return `${current.label}: ${formatValue(current.value)}`;
  });

  protected onRemove(event: MouseEvent): void {
    event.stopPropagation();
    this.removed.emit();
  }
}

function isDateRange(value: unknown): value is DateRangeValue {
  return typeof value === 'object' && value !== null && 'startDate' in value && 'endDate' in value;
}

function formatPrimitive(value: FilterPrimitive): string {
  if (value === null) return '';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'string') return humanize(value);
  return String(value);
}

function formatValue(value: FilterValue): string {
  if (Array.isArray(value)) {
    const arr = value as readonly FilterPrimitive[];
    if (arr.length === 0) return '';
    if (arr.length === 1) return formatPrimitive(arr[0]);
    return `${arr.length} seleccionados`;
  }
  if (isDateRange(value)) {
    const start = value.startDate ?? '…';
    const end = value.endDate ?? '…';
    return `${start} → ${end}`;
  }
  return formatPrimitive(value as FilterPrimitive);
}
