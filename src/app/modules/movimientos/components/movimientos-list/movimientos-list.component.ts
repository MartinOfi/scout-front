/**
 * Movimientos List Component
 * Smart Component - max 200 líneas
 * Lista de movimientos con filtros
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MovimientosStateService } from '../../services/movimientos-state.service';
import { Movimiento, MovimientosFilters } from '../../../../shared/models';
import { TipoMovimientoEnum } from '../../../../shared/enums';

// Dumb Components
import { MovimientoRowComponent } from './components/movimiento-row/movimiento-row.component';
import { MovimientoFiltersComponent } from './components/movimiento-filters/movimiento-filters.component';

@Component({
  selector: 'app-movimientos-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MovimientoRowComponent,
    MovimientoFiltersComponent
  ],
  templateUrl: './movimientos-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovimientosListComponent implements OnInit {
  private readonly state = inject(MovimientosStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signals del estado
  readonly movimientos = this.state.filtered;
  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly totalIngresos = this.state.totalIngresos;
  readonly totalEgresos = this.state.totalEgresos;
  readonly saldoNeto = this.state.saldoNeto;

  ngOnInit(): void {
    // Leer filtros de query params
    this.route.queryParams.subscribe((params) => {
      const filters: MovimientosFilters = {};
      if (params['cajaId']) filters.cajaId = params['cajaId'];
      if (params['tipo']) filters.tipo = params['tipo'];
      if (params['concepto']) filters.concepto = params['concepto'];
      if (params['fechaInicio']) filters.fechaInicio = params['fechaInicio'];
      if (params['fechaFin']) filters.fechaFin = params['fechaFin'];
      
      this.state.setFilters(filters);
    });

    this.state.load();
  }

  onFilterChange(filters: MovimientosFilters): void {
    this.state.setFilters(filters);
  }

  onClearFilters(): void {
    this.state.clearFilters();
  }

  onNuevoMovimiento(): void {
    this.router.navigate(['/movimientos/nuevo']);
  }

  onVerDetalle(id: string): void {
    this.router.navigate(['/movimientos', id]);
  }

  onEditar(id: string): void {
    this.router.navigate(['/movimientos', id, 'editar']);
  }

  onEliminar(id: string): void {
    if (confirm('¿Estás seguro de eliminar este movimiento?')) {
      this.state.delete(id).subscribe();
    }
  }
}
