/**
 * Reporte Eventos Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportesStateService } from '../../services/reportes-state.service';

@Component({
  selector: 'app-reporte-eventos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporte-eventos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReporteEventosComponent implements OnInit {
  private readonly state = inject(ReportesStateService);

  readonly loading = this.state.loading;

  ngOnInit(): void {
    // TODO: Cargar reporte de eventos
  }
}
