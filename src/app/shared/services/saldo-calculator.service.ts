/**
 * Saldo Calculator Service
 * Calculates balances dynamically (RN6 - never store, always calculate)
 * SIN any - fully typed
 *
 * Uses correct API endpoints:
 * - GET /cajas/grupo - Get caja de grupo
 * - GET /cajas?tipo={tipo} - Get cajas by type
 * - GET /movimientos/saldo/:cajaId - Get saldo of a caja
 */

import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { CajasApiService } from '../../modules/cajas/services/cajas-api.service';
import { MovimientosApiService } from '../../modules/movimientos/services/movimientos-api.service';
import { Producto, VentaProducto } from '../models';
import { Rama, RamaEnum, CajaType } from '../enums';

/** Map Rama enum to CajaType for fondo de rama */
const RAMA_TO_CAJA_TYPE: Record<Rama, CajaType> = {
  [RamaEnum.MANADA]: CajaType.RAMA_MANADA,
  [RamaEnum.UNIDAD]: CajaType.RAMA_UNIDAD,
  [RamaEnum.CAMINANTES]: CajaType.RAMA_CAMINANTES,
  [RamaEnum.ROVERS]: CajaType.RAMA_ROVERS,
};

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
   * Calculate saldo of a caja by ID
   * Uses GET /movimientos/saldo/:cajaId
   */
  calcularSaldoCaja(cajaId: string): Observable<number> {
    return this.cajasApi.getSaldo(cajaId).pipe(
      map(response => response.saldo)
    );
  }

  /**
   * Calculate saldo of grupo caja
   * First gets caja de grupo, then uses its ID for saldo
   */
  calcularSaldoGrupo(): Observable<number> {
    return this.cajasApi.getCajaGrupo().pipe(
      switchMap(caja => this.cajasApi.getSaldo(caja.id)),
      map(response => response.saldo)
    );
  }

  /**
   * Calculate saldo of a rama fund
   * First gets caja by type, then uses its ID for saldo
   */
  calcularSaldoFondoRama(rama: Rama): Observable<number> {
    const cajaType = RAMA_TO_CAJA_TYPE[rama];
    return this.cajasApi.getByType(cajaType).pipe(
      switchMap(cajas => {
        const caja = cajas[0];
        if (!caja) {
          throw new Error(`No se encontró caja para rama ${rama}`);
        }
        return this.cajasApi.getSaldo(caja.id);
      }),
      map(response => response.saldo)
    );
  }

  /**
   * Calculate saldo of a personal account by caja ID
   */
  calcularSaldoCuentaPersonal(cajaId: string): Observable<number> {
    return this.cajasApi.getSaldo(cajaId).pipe(
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
