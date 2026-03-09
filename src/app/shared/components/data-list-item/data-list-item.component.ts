/**
 * DataListItem Component
 * Reusable row with icon, primary/secondary text, and value
 */

import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IconVariant, ValueColorVariant } from '../data-list/data-list.models';

@Component({
  selector: 'app-data-list-item',
  standalone: true,
  imports: [MatIconModule, CurrencyPipe],
  templateUrl: './data-list-item.component.html',
  styleUrl: './data-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataListItemComponent {
  readonly icon = input.required<string>();
  readonly iconVariant = input<IconVariant>('info');
  readonly primaryText = input.required<string>();
  readonly secondaryText = input<string>('');
  readonly value = input.required<number>();
  readonly valueVariant = input<ValueColorVariant>('auto');

  readonly valueColorClass = computed(() => {
    const variant = this.valueVariant();
    const val = this.value();

    if (variant === 'auto') {
      return val >= 0 ? 'data-list-item__value--success' : 'data-list-item__value--danger';
    }

    if (variant === 'neutral') {
      return '';
    }

    return `data-list-item__value--${variant}`;
  });
}
