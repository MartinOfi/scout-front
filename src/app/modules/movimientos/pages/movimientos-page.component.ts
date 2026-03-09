/**
 * Movimientos Page Component
 * Página principal del módulo de movimientos
 * SIN any - tipado estricto
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-movimientos-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './movimientos-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovimientosPageComponent {}
