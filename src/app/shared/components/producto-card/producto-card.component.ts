/**
 * ProductoCard Component (Dumb)
 * Displays a single producto with cost, sale price, margin, and sales count.
 */

import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Producto } from '../../models';

@Component({
  selector: 'app-producto-card',
  standalone: true,
  imports: [NgClass, MatIconModule, MatButtonModule],
  templateUrl: './producto-card.component.html',
  styleUrl: './producto-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoCardComponent {
  readonly producto = input.required<Producto>();
  readonly remove = output<string>();

  readonly ganancia = computed(() => this.producto().precioVenta - this.producto().precioCosto);

  readonly gananciaClass = computed(() =>
    this.ganancia() >= 0 ? 'producto-card__stat--positive' : 'producto-card__stat--negative',
  );

  onRemove(): void {
    this.remove.emit(this.producto().id);
  }

  format(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
}
