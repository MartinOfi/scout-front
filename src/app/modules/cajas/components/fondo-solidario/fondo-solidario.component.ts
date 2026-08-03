/**
 * Fondo Solidario Component
 * Muestra el saldo del fondo solidario y permite crearlo o financiarlo.
 * Su saldo NO es parte de la caja de grupo.
 */

import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { TransferenciaDialogComponent } from '../../../movimientos/components/transferencia-dialog/transferencia-dialog.component';
import { CajasStateService } from '../../services/cajas-state.service';
import { CajaType } from '../../../../shared/enums';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-fondo-solidario',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    StatCardComponent,
    ActionButtonComponent,
  ],
  templateUrl: './fondo-solidario.component.html',
  styleUrl: './fondo-solidario.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FondoSolidarioComponent implements OnInit {
  private readonly state = inject(CajasStateService);
  private readonly dialog = inject(MatDialog);

  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly cajaFondoSolidarioId = this.state.cajaFondoSolidarioId;
  readonly saldo = this.state.saldoFondoSolidario;
  readonly bonificacionesOtorgadas = this.state.bonificacionesOtorgadas;

  ngOnInit(): void {
    this.state.loadConsolidado();
  }

  onCrear(): void {
    this.state
      .create({ tipo: CajaType.FONDO_SOLIDARIO, nombre: 'Fondo Solidario' })
      .subscribe(() => this.state.loadConsolidado());
  }

  onTransferir(): void {
    const cajaGrupo = this.state.cajaGrupo();
    if (!cajaGrupo) return;

    const ref = this.dialog.open(TransferenciaDialogComponent, {
      data: { cajaGrupo },
      autoFocus: false,
      restoreFocus: false,
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        this.state.loadConsolidado();
      }
    });
  }
}
