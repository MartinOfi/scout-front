import { FilterType } from '../filter-type.enum';

/**
 * Ícono de Material por cada {@link FilterType}.
 *
 * Usa nombres de `mat-icon` del set `Material Symbols Outlined`.
 */
export const FILTER_ICONS_BY_TYPE: Readonly<Record<FilterType, string>> = {
  [FilterType.SELECT]: 'radio_button_checked',
  [FilterType.MULTI_SELECT]: 'checklist',
  [FilterType.TEXT]: 'text_fields',
  [FilterType.SEARCH]: 'search',
  [FilterType.NUMBER]: 'pin',
  [FilterType.DATE]: 'event',
  [FilterType.DATE_RANGE]: 'date_range',
  [FilterType.BOOLEAN]: 'toggle_on',
  [FilterType.CHIPS]: 'label',
  [FilterType.CUSTOM]: 'tune',
} as const;

export function getIconForType(type: FilterType): string {
  return FILTER_ICONS_BY_TYPE[type];
}
