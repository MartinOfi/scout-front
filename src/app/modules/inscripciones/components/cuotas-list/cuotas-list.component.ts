/**
 * Cuotas List Component
 * Smart Component - max 200 lineas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { CuotasStateService } from '../../../cuotas/services/cuotas-state.service';
import { Cuota } from '../../../../shared/models';
import { EstadoCuota, ESTADO_CUOTA_LABELS } from '../../../../shared/enums';

@Component({
  selector: 'app-cuotas-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './cuotas-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CuotasListComponent implements OnInit {
  readonly state: CuotasStateService = inject(CuotasStateService);
  private readonly router = inject(Router);

  readonly cuotas = this.state.cuotas;
  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly estadoLabels = ESTADO_CUOTA_LABELS;

  displayedColumns: string[] = ['persona', 'numero', 'ano', 'monto', 'estado', 'acciones'];

  ngOnInit(): void {
    this.state.load();
  }

  getEstadoLabel(estado: EstadoCuota): string {
    return this.estadoLabels[estado];
  }

  onBack(): void {
    this.router.navigate(['/inscripciones']);
  }
}
