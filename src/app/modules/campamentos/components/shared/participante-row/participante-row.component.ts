/**
 * Participante Row Component
 * Dumb Component - max 80 líneas
 * SIN any - tipado estricto
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { PagoParticipante } from '../../../../../shared/models';

@Component({
  selector: 'app-participante-row',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  templateUrl: './participante-row.component.html',
  styleUrl: './participante-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipanteRowComponent {
  @Input({ required: true }) participante!: PagoParticipante;

  @Output() registrarPago = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  get montoAdeudado(): number {
    return this.participante.saldoPendiente;
  }

  get porcentajePagado(): number {
    const total = this.participante.costoPorPersona;
    return total > 0 ? ((this.participante.totalPagado / total) * 100) : 0;
  }

  get estadoPago(): 'completo' | 'parcial' | 'pendiente' {
    if (this.montoAdeudado === 0) return 'completo';
    if (this.participante.totalPagado > 0) return 'parcial';
    return 'pendiente';
  }

  onRegistrarPago(): void {
    this.registrarPago.emit(this.participante.participanteId);
  }

  onRemove(): void {
    this.remove.emit(this.participante.participanteId);
  }
}
