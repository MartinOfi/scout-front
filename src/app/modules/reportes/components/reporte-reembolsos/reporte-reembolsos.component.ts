/**
 * Reporte Reembolsos Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportesStateService } from '../../services/reportes-state.service';

@Component({
  selector: 'app-reporte-reembolsos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporte-reembolsos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReporteReembolsosComponent implements OnInit {
  private readonly state = inject(ReportesStateService);

  readonly loading = this.state.loading;

  ngOnInit(): void {
    // TODO: Cargar reporte de reembolsos
  }
}
