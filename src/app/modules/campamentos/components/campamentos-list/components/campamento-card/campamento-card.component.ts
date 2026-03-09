/**
 * Campamento Card Component
 * Dumb Component - max 80 líneas
 * SIN any - tipado estricto
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { Campamento } from '../../../../../../shared/models';

@Component({
  selector: 'app-campamento-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './campamento-card.component.html',
  styleUrl: './campamento-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampamentoCardComponent {
  @Input({ required: true }) campamento!: Campamento;

  @Output() select = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

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
