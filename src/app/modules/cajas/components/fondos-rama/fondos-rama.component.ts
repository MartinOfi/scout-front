/**
 * Fondos Rama Component
 * Smart Component - max 200 líneas
 * Gestiona los fondos de cada rama
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CajasStateService } from '../../services/cajas-state.service';
import { Rama, RamaEnum, CajaType, CAJA_TYPE_LABELS } from '../../../../shared/enums';
import { CajaConSaldo } from '../../../../shared/models';

// Dumb Component
import { FondoCardComponent } from './components/fondo-card/fondo-card.component';

@Component({
  selector: 'app-fondos-rama',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FondoCardComponent
  ],
  templateUrl: './fondos-rama.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FondosRamaComponent implements OnInit {
  private readonly state = inject(CajasStateService);
  private readonly router = inject(Router);

  // Signals del estado
  readonly cajasRama = this.state.cajasRama;
  readonly saldoManada = this.state.saldoManada;
  readonly saldoUnidad = this.state.saldoUnidad;
  readonly saldoCaminantes = this.state.saldoCaminantes;
  readonly saldoRovers = this.state.saldoRovers;
  readonly totalSaldosRamas = this.state.totalSaldosRamas;
  readonly loading = this.state.loading;

  readonly ramas: Rama[] = [RamaEnum.MANADA, RamaEnum.UNIDAD, RamaEnum.CAMINANTES, RamaEnum.ROVERS];
  readonly ramaLabels = CAJA_TYPE_LABELS;

  ngOnInit(): void {
    this.state.loadTodasCajasRama();
  }

  getSaldoRama(rama: Rama): number {
    const caja = this.cajasRama()[rama];
    return caja?.saldo ?? 0;
  }

  getRamaLabel(rama: Rama): string {
    const cajaTypeMap: Record<Rama, CajaType> = {
      [RamaEnum.MANADA]: CajaType.RAMA_MANADA,
      [RamaEnum.UNIDAD]: CajaType.RAMA_UNIDAD,
      [RamaEnum.CAMINANTES]: CajaType.RAMA_CAMINANTES,
      [RamaEnum.ROVERS]: CajaType.RAMA_ROVERS
    };
    return this.ramaLabels[cajaTypeMap[rama]];
  }

  onVerMovimientosRama(rama: Rama): void {
    this.router.navigate(['/movimientos'], {
      queryParams: { rama }
    });
  }

  onRegistrarMovimiento(rama: Rama): void {
    const caja = this.cajasRama()[rama];
    if (caja) {
      this.router.navigate(['/movimientos/nuevo'], {
        queryParams: { cajaId: caja.id }
      });
    }
  }

  getRamaIcon(rama: Rama): string {
    const icons: Record<Rama, string> = {
      [RamaEnum.MANADA]: 'pets',
      [RamaEnum.UNIDAD]: 'groups',
      [RamaEnum.CAMINANTES]: 'hiking',
      [RamaEnum.ROVERS]: 'terrain'
    };
    return icons[rama] || 'account_balance';
  }
}
