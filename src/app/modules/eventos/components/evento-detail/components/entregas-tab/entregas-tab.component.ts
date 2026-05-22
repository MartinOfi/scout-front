/**
 * Entregas Tab Component (dumb / presentational)
 *
 * Renders one row per vendedor that has ventas in the evento. Each row shows:
 *   - Vendor name (alphabetical order across rows)
 *   - For each producto sold by that vendor: "Locro 3/10" (entregado/vendido)
 *   - A "Registrar entrega" button that opens the entrega dialog preselected
 *     to this vendor.
 *   - Expandable section listing every entrega of this vendor with its lines
 *     and notas. Each entrega has its own delete button.
 *
 * All state is computed from the inputs (`stock`, `entregas`). No HTTP, no
 * mutation — the parent smart component owns those side effects.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EntregaResponse, StockEntregaResponse } from '../../../../../../shared/models';

/**
 * A producto row inside a VendedorRow, with delivered/sold counters.
 */
interface ProductoStock {
  productoId: string;
  productoNombre: string;
  cantidadVendida: number;
  cantidadEntregada: number;
}

/**
 * One row per vendedor in the entregas tab.
 *
 * `tieneStockDisponible` is precomputed so the template can hide the
 * "Registrar entrega" button when there's nothing left to deliver,
 * without doing arithmetic during change detection.
 */
interface VendedorRow {
  vendedorId: string;
  vendedorNombre: string;
  productos: ProductoStock[];
  entregas: EntregaResponse[];
  tieneStockDisponible: boolean;
}

@Component({
  selector: 'app-entregas-tab',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule, DatePipe],
  templateUrl: './entregas-tab.component.html',
  styleUrl: './entregas-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntregasTabComponent {
  private readonly _stock = signal<StockEntregaResponse[]>([]);
  private readonly _entregas = signal<EntregaResponse[]>([]);
  private readonly _deletingIds = signal<ReadonlySet<string>>(new Set());
  private readonly _expanded = signal<ReadonlySet<string>>(new Set());

  @Input() set stock(value: StockEntregaResponse[]) {
    this._stock.set(value ?? []);
  }

  @Input() set entregas(value: EntregaResponse[]) {
    this._entregas.set(value ?? []);
  }

  @Input() set deletingIds(value: ReadonlySet<string>) {
    this._deletingIds.set(value ?? new Set());
  }

  @Output() readonly registrarEntrega = new EventEmitter<string>();
  @Output() readonly deleteEntrega = new EventEmitter<string>();

  /**
   * Bucket stock + entregas by vendedorId and sort vendors alphabetically.
   * Productos inside each vendor are also sorted alphabetically for stable
   * rendering.
   */
  readonly rows = computed((): VendedorRow[] => {
    const stock = this._stock();
    const entregas = this._entregas();

    // Phase 1: bucket productos + capture vendor names from the stock list.
    const productosByVendedor = new Map<string, ProductoStock[]>();
    const nombresByVendedor = new Map<string, string>();
    for (const row of stock) {
      const producto: ProductoStock = {
        productoId: row.productoId,
        productoNombre: row.productoNombre,
        cantidadVendida: row.cantidadVendida,
        cantidadEntregada: row.cantidadEntregada,
      };
      productosByVendedor.set(row.vendedorId, [
        ...(productosByVendedor.get(row.vendedorId) ?? []),
        producto,
      ]);
      nombresByVendedor.set(row.vendedorId, row.vendedorNombre);
    }

    // Phase 2: bucket entregas by vendedor.
    const entregasByVendedor = new Map<string, EntregaResponse[]>();
    for (const entrega of entregas) {
      entregasByVendedor.set(entrega.vendedorId, [
        ...(entregasByVendedor.get(entrega.vendedorId) ?? []),
        entrega,
      ]);
    }

    // Phase 3: assemble each row once, fully populated. No post-construction
    // mutation — every array we expose is the result of `.toSorted()`-style
    // ops on a fresh copy, never an in-place sort on what becomes the row's
    // `productos` / `entregas`.
    const rows: VendedorRow[] = Array.from(productosByVendedor.entries()).map(
      ([vendedorId, productos]) => {
        const sortedProductos = [...productos].sort((a, b) =>
          a.productoNombre.localeCompare(b.productoNombre),
        );
        const sortedEntregas = [...(entregasByVendedor.get(vendedorId) ?? [])].sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        );
        return {
          vendedorId,
          vendedorNombre: nombresByVendedor.get(vendedorId) ?? '',
          productos: sortedProductos,
          entregas: sortedEntregas,
          tieneStockDisponible: sortedProductos.some(
            (p) => p.cantidadVendida - p.cantidadEntregada > 0,
          ),
        };
      },
    );

    return [...rows].sort((a, b) => a.vendedorNombre.localeCompare(b.vendedorNombre));
  });

  isExpanded(vendedorId: string): boolean {
    return this._expanded().has(vendedorId);
  }

  toggleExpanded(vendedorId: string): void {
    this._expanded.update((prev) => {
      const next = new Set(prev);
      if (next.has(vendedorId)) {
        next.delete(vendedorId);
      } else {
        next.add(vendedorId);
      }
      return next;
    });
  }

  isDeleting(id: string): boolean {
    return this._deletingIds().has(id);
  }

  onRegistrar(vendedorId: string, event: Event): void {
    event.stopPropagation();
    this.registrarEntrega.emit(vendedorId);
  }

  onDelete(entregaId: string, event: Event): void {
    event.stopPropagation();
    this.deleteEntrega.emit(entregaId);
  }
}
