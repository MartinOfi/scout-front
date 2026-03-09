/**
 * Evento Detail Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EventosStateService } from '../../services/eventos-state.service';
import { Evento } from '../../../../shared/models';
import { TIPO_EVENTO_LABELS, TipoEvento } from '../../../../shared/enums';

@Component({
  selector: 'app-evento-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './evento-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventoDetailComponent implements OnInit {
  private readonly state: EventosStateService = inject(EventosStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly eventos = this.state.eventos;
  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly tipoLabels = TIPO_EVENTO_LABELS;

  eventoId: string | null = null;

  ngOnInit(): void {
    this.eventoId = this.route.snapshot.paramMap.get('id');
    if (this.eventoId) {
      this.state.select(this.eventoId);
      this.state.loadProductos(this.eventoId);
      this.state.loadVentas(this.eventoId);
    }
  }

  get evento(): Evento | null {
    if (!this.eventoId) return null;
    return this.eventos().find((e: Evento) => e.id === this.eventoId) ?? null;
  }

  getTipoLabel(tipo: TipoEvento): string {
    return this.tipoLabels[tipo];
  }

  onEdit(): void {
    if (this.eventoId) {
      this.router.navigate(['/eventos', this.eventoId, 'editar']);
    }
  }

  onBack(): void {
    this.router.navigate(['/eventos']);
  }
}
