/**
 * Caja Drawer Component
 * Drawer panel showing caja details and movimientos
 * Uses signals from CajasStateService
 */

import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { CajasStateService, MovimientoFilterType } from '../../services/cajas-state.service';
import {
  TipoMovimientoEnum,
  CONCEPTO_MOVIMIENTO_LABELS,
  ConceptoMovimiento,
} from '../../../../shared/enums';
import { humanize } from '../../../../shared/pipes';

@Component({
  selector: 'app-caja-drawer',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './caja-drawer.component.html',
  styleUrls: ['./caja-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CajaDrawerComponent {
  private readonly state = inject(CajasStateService);

  // Outputs
  readonly close = output<void>();
  readonly registrarMovimiento = output<void>();
  readonly verTodosMovimientos = output<void>();

  // State from service
  readonly selectedCaja = this.state.selectedCaja;
  readonly loading = this.state.selectedCajaLoading;
  readonly movimientos = this.state.filteredSelectedCajaMovimientos;
  readonly currentFilter = this.state.movimientosFilter;

  // Constants
  readonly TipoMovimiento = TipoMovimientoEnum;
  readonly conceptoLabels = CONCEPTO_MOVIMIENTO_LABELS;

  onClose(): void {
    this.state.closeDrawer();
    this.close.emit();
  }

  onFilterChange(filter: MovimientoFilterType): void {
    this.state.setMovimientosFilter(filter);
  }

  onRegistrarMovimiento(): void {
    this.registrarMovimiento.emit();
  }

  onVerTodos(): void {
    this.verTodosMovimientos.emit();
  }

  getConceptoLabel(concepto: ConceptoMovimiento | string): string {
    if (concepto in this.conceptoLabels) {
      return this.conceptoLabels[concepto as ConceptoMovimiento];
    }
    return humanize(concepto, 'none');
  }
}
