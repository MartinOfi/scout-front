/**
 * Evento Card Component
 * Dumb Component — expedition-inspired design, mirrors CampamentoCardComponent
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { Evento } from '../../../../../../shared/models';
import { TipoEvento, TIPO_EVENTO_LABELS } from '../../../../../../shared/enums';

@Component({
  selector: 'app-evento-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, DatePipe],
  templateUrl: './evento-card.component.html',
  styleUrl: './evento-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventoCardComponent {
  @Input({ required: true }) evento!: Evento;

  @Output() select = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();

  get tipoLabel(): string {
    return TIPO_EVENTO_LABELS[this.evento.tipo] ?? this.evento.tipo;
  }

  get isVenta(): boolean {
    return this.evento.tipo === TipoEvento.VENTA;
  }

  get productosCount(): number {
    return this.evento.productos?.length ?? 0;
  }

  onSelect(): void {
    this.select.emit(this.evento.id);
  }

  onEdit(): void {
    this.edit.emit(this.evento.id);
  }
}
