/**
 * Cuenta Resumen Cards Component
 * Displays financial summary: personal account balance and debt breakdown
 */

import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CuentaPersonalResumen, DeudaTotal } from '../../../../models';
import { StatCardComponent } from '../../../../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-cuenta-resumen-cards',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './cuenta-resumen-cards.component.html',
  styleUrl: './cuenta-resumen-cards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuentaResumenCardsComponent {
  readonly cuentaPersonal = input.required<CuentaPersonalResumen>();
  readonly deudaTotal = input.required<DeudaTotal>();

  get saldoVariant(): 'success' | 'warning' | 'danger' {
    const saldo = this.cuentaPersonal().saldo;
    if (saldo > 0) return 'success';
    if (saldo < 0) return 'danger';
    return 'warning';
  }

  get deudaVariant(): 'success' | 'danger' {
    return this.deudaTotal().total > 0 ? 'danger' : 'success';
  }
}
