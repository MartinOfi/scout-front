/**
 * Campamento Card Component
 * Dumb Component - expedition-inspired design
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
  input,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { Campamento } from '../../../../../../shared/models';
import { MoneyPipe } from '../../../../../../shared/pipes/money.pipe';

type CampStatus = 'upcoming' | 'active' | 'past';

@Component({
  selector: 'app-campamento-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MoneyPipe, DatePipe],
  templateUrl: './campamento-card.component.html',
  styleUrl: './campamento-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampamentoCardComponent {
  @Input({ required: true }) campamento!: Campamento;

  @Output() select = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  /** Calculate camp status based on dates */
  get status(): CampStatus {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(this.campamento.fechaInicio);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.campamento.fechaFin);
    end.setHours(23, 59, 59, 999);

    if (today < start) return 'upcoming';
    if (today >= start && today <= end) return 'active';
    return 'past';
  }

  /** Days until camp starts (null if not upcoming) */
  get daysUntil(): number | null {
    if (this.status !== 'upcoming') return null;

    const today = new Date();
    const start = new Date(this.campamento.fechaInicio);
    const diff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  }

  onSelect(): void {
    this.select.emit(this.campamento.id);
  }

  onEdit(): void {
    this.edit.emit(this.campamento.id);
  }

  onDelete(): void {
    this.delete.emit(this.campamento.id);
  }
}
