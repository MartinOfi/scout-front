import { filtrarMovimientos } from './movimiento-filter.util';
import {
  FiltroMovimientos,
  ConceptoMovimiento,
  TipoMovimientoEnum,
} from '../enums';

interface Mov {
  id: string;
  tipo: string;
  concepto: string;
}

describe('filtrarMovimientos', () => {
  const ingreso: Mov = {
    id: 'i1',
    tipo: TipoMovimientoEnum.INGRESO,
    concepto: ConceptoMovimiento.EVENTO_VENTA_INGRESO,
  };
  const recupero: Mov = {
    id: 'i2',
    tipo: TipoMovimientoEnum.INGRESO,
    concepto: ConceptoMovimiento.EVENTO_VENTA_RECUPERO_COSTO,
  };
  const gasto: Mov = {
    id: 'e1',
    tipo: TipoMovimientoEnum.EGRESO,
    concepto: ConceptoMovimiento.EVENTO_VENTA_GASTO,
  };
  const usoSaldo: Mov = {
    id: 'e2',
    tipo: TipoMovimientoEnum.EGRESO,
    concepto: ConceptoMovimiento.USO_SALDO_PERSONAL,
  };
  const todos = [ingreso, recupero, gasto, usoSaldo];

  it('TODOS devuelve todos los movimientos', () => {
    expect(filtrarMovimientos(todos, FiltroMovimientos.TODOS)).toEqual(todos);
  });

  it('INGRESOS devuelve solo los de tipo ingreso', () => {
    expect(filtrarMovimientos(todos, FiltroMovimientos.INGRESOS)).toEqual([
      ingreso,
      recupero,
    ]);
  });

  it('EGRESOS devuelve todos los egresos (incluye uso_saldo_personal)', () => {
    expect(filtrarMovimientos(todos, FiltroMovimientos.EGRESOS)).toEqual([
      gasto,
      usoSaldo,
    ]);
  });

  it('GASTOS devuelve egresos reales (excluye uso_saldo_personal)', () => {
    expect(filtrarMovimientos(todos, FiltroMovimientos.GASTOS)).toEqual([gasto]);
  });

  it('no muta el array original', () => {
    const copia = [...todos];
    filtrarMovimientos(todos, FiltroMovimientos.TODOS);
    expect(todos).toEqual(copia);
  });
});
