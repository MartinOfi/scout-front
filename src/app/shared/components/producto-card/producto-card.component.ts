/**
 * ProductoCard Component (Dumb)
 * Displays a single producto with cost, sale price, margin, and sales count.
 */

import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Producto } from '../../models';
import { MoneyPipe } from '../../pipes/money.pipe';

@Component({
  selector: 'app-producto-card',
  standalone: true,
  imports: [NgClass, MatIconModule, MatButtonModule, MoneyPipe],
  templateUrl: './producto-card.component.html',
  styleUrl: './producto-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoCardComponent {
  readonly producto = input.required<Producto>();
  readonly readonly = input<boolean>(false);
  readonly remove = output<string>();
  readonly edit = output<Producto>();

  /** True when the producto has no cost loaded yet. */
  readonly sinCosto = computed(() => this.producto().precioCosto === null);

  readonly ganancia = computed<number | null>(() => {
    const costo = this.producto().precioCosto;
    return costo === null ? null : this.producto().precioVenta - costo;
  });

  readonly gananciaClass = computed(() => {
    const ganancia = this.ganancia();
    if (ganancia === null) return 'producto-card__stat--pending';
    return ganancia >= 0 ? 'producto-card__stat--positive' : 'producto-card__stat--negative';
  });

  onRemove(): void {
    this.remove.emit(this.producto().id);
  }

  onEdit(): void {
    this.edit.emit(this.producto());
  }
}
