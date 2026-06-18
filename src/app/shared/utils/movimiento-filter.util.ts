import {
  FiltroMovimientos,
  ConceptoMovimiento,
  TipoMovimientoEnum,
} from '../enums';

/**
 * Forma mínima necesaria para clasificar un movimiento en los filtros.
 * Acepta tanto el `Movimiento` (tipo: TipoMovimientoEnum) como DTOs que usan
 * el union string, porque ambos campos son asignables a `string`.
 */
export interface MovimientoFiltrable {
  tipo: string;
  concepto: string;
}

/**
 * Filtra una lista de movimientos según el filtro de la UI. Lógica compartida
 * entre campamentos y eventos (mismas reglas). No muta la lista original.
 *
 * - TODOS: todo
 * - INGRESOS: tipo ingreso
 * - EGRESOS: todos los egresos (incluye uso_saldo_personal)
 * - GASTOS: egresos reales (excluye uso_saldo_personal)
 */
export function filtrarMovimientos<T extends MovimientoFiltrable>(
  movimientos: readonly T[],
  filtro: FiltroMovimientos,
): T[] {
  switch (filtro) {
    case FiltroMovimientos.INGRESOS:
      return movimientos.filter((m) => m.tipo === TipoMovimientoEnum.INGRESO);
    case FiltroMovimientos.EGRESOS:
      return movimientos.filter((m) => m.tipo === TipoMovimientoEnum.EGRESO);
    case FiltroMovimientos.GASTOS:
      return movimientos.filter(
        (m) =>
          m.tipo === TipoMovimientoEnum.EGRESO &&
          m.concepto !== ConceptoMovimiento.USO_SALDO_PERSONAL,
      );
    case FiltroMovimientos.TODOS:
    default:
      return [...movimientos];
  }
}
