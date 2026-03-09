/**
 * Resumen Financiero Component (Dumb)
 * Max 60 líneas - SIN any
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-resumen-financiero',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './resumen-financiero.component.html',
  styleUrl: './resumen-financiero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResumenFinancieroComponent {
  @Input({ required: true }) totalIngresos!: number;
  @Input({ required: true }) totalEgresos!: number;

  get resultadoNeto(): number {
    return this.totalIngresos - this.totalEgresos;
  }

  get esPositivo(): boolean {
    return this.resultadoNeto >= 0;
  }
}
