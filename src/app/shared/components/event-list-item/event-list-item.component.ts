/**
 * EventListItem Component
 * Event row with date badge, title, and category tag
 */

import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { NgStyle } from '@angular/common';

export interface EventCategoryConfig {
  readonly label: string;
  readonly backgroundColor: string;
  readonly textColor: string;
}

const MONTH_ABBREVIATIONS = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
];

@Component({
  selector: 'app-event-list-item',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './event-list-item.component.html',
  styleUrl: './event-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventListItemComponent {
  readonly fecha = input.required<Date>();
  readonly titulo = input.required<string>();
  readonly categoria = input.required<EventCategoryConfig>();

  readonly clicked = output<void>();

  readonly mesAbreviado = computed(() => MONTH_ABBREVIATIONS[this.fecha().getMonth()]);
  readonly dia = computed(() => this.fecha().getDate());

  readonly categoryStyles = computed(() => ({
    'background-color': this.categoria().backgroundColor,
    color: this.categoria().textColor,
  }));

  onClick(): void {
    this.clicked.emit();
  }
}
