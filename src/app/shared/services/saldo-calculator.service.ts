/**
 * Saldo Calculator Service
 * Calculates balances dynamically (RN6 - never store, always calculate)
 * SIN any - fully typed
 */

import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CajasApiService } from '../../modules/cajas/services/cajas-api.service';
import { MovimientosApiService } from '../../modules/movimientos/services/movimientos-api.service';
import { Producto, VentaProducto } from '../models';
import { Rama } from '../enums';

/**
 * Saldo calculator service
 * Implements RN6: All balances calculated from movements, never stored
 */
@Injectable({
  providedIn: 'root',
})
export class SaldoCalculatorService {
  private readonly cajasApi = inject(CajasApiService);
  private readonly movimientosApi = inject(MovimientosApiService);

  /**
   * Calculate saldo of a caja
   */
  calcularSaldoCaja(cajaId: string): Observable<number> {
    return this.cajasApi.getById(cajaId).pipe(
      map(caja => caja.saldo)
    );
  }

  /**
   * Calculate saldo of grupo caja
   */
  calcularSaldoGrupo(): Observable<number> {
    return this.cajasApi.getSaldoGrupo().pipe(
      map(response => response.saldo)
    );
  }

  /**
   * Calculate saldo of a rama fund
   */
  calcularSaldoFondoRama(rama: Rama): Observable<number> {
    return this.cajasApi.getSaldoRama(rama).pipe(
      map(response => response.saldo)
    );
  }

  /**
   * Calculate saldo of a personal account
   */
  calcularSaldoCuentaPersonal(personaId: string): Observable<number> {
    return this.cajasApi.getSaldoPersonal(personaId).pipe(
      map(response => response.saldo)
    );
  }

  /**
   * Calculate event profit from sales
   */
  calcularGananciaEvento(
    ventas: VentaProducto[], 
    productos: Producto[]
  ): number {
    return ventas.reduce((ganancia, venta) => {
      const producto = productos.find(p => p.id === venta.productoId);
      if (!producto) return ganancia;
      return ganancia + ((producto.precioVenta - producto.precioCosto) * venta.cantidad);
    }, 0);
  }

  /**
   * Calculate campamento result (ingresos - gastos)
   */
  calcularResultadoCampamento(ingresos: number, gastos: number): number {
    return ingresos - gastos;
  }

  /**
   * Calculate profit per person for an event
   */
  calcularGananciaPorPersona(
    ventas: VentaProducto[],
    productos: Producto[]
  ): Map<string, number> {
    const gananciaPorPersona = new Map<string, number>();

    ventas.forEach(venta => {
      const producto = productos.find(p => p.id === venta.productoId);
      if (!producto) return;

      const gananciaVenta = (producto.precioVenta - producto.precioCosto) * venta.cantidad;
      
      const gananciaActual = gananciaPorPersona.get(venta.personaId) || 0;
      gananciaPorPersona.set(venta.personaId, gananciaActual + gananciaVenta);
    });

    return gananciaPorPersona;
  }
}
