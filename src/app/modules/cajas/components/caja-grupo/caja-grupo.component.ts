/**
 * Caja Grupo Component
 * Smart Component - max 200 líneas
 * Gestiona la caja principal del grupo scout
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CajasStateService } from '../../services/cajas-state.service';
import { CajaConSaldo, Movimiento } from '../../../../shared/models';

// Dumb Components
import { SaldoCardComponent } from './components/saldo-card/saldo-card.component';
import { MovimientosTableComponent } from './components/movimientos-table/movimientos-table.component';

@Component({
  selector: 'app-caja-grupo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SaldoCardComponent,
    MovimientosTableComponent
  ],
  templateUrl: './caja-grupo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CajaGrupoComponent implements OnInit {
  private readonly state = inject(CajasStateService);
  private readonly router = inject(Router);

  // Signals del estado
  readonly cajaGrupo = this.state.cajaGrupo;
  readonly saldoGrupo = this.state.saldoGrupo;
  readonly movimientosGrupo = this.state.movimientosGrupo;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  ngOnInit(): void {
    this.state.loadCajaGrupo();
    this.state.loadMovimientosGrupo();
  }

  onVerTodosMovimientos(): void {
    this.router.navigate(['/movimientos'], {
      queryParams: { caja: 'grupo' }
    });
  }

  onRegistrarMovimiento(): void {
    const caja = this.cajaGrupo();
    if (caja) {
      this.router.navigate(['/movimientos/nuevo'], {
        queryParams: { cajaId: caja.id }
      });
    }
  }

  onVerMovimiento(id: string): void {
    this.router.navigate(['/movimientos', id]);
  }
}
