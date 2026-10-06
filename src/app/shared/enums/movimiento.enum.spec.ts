import {
  MedioPagoEnum,
  MEDIOS_PAGO,
  MEDIO_PAGO_LABELS,
  CONCEPTOS_MANUALES_POR_TIPO,
  TipoMovimientoEnum,
  ConceptoMovimiento,
  CATEGORIA_MOVIMIENTO_LABELS,
  CategoriaMovimiento,
  CONCEPTO_MOVIMIENTO_LABELS,
} from './movimiento.enum';

describe('MedioPagoEnum', () => {
  it('should include mixto value', () => {
    expect(MedioPagoEnum.MIXTO).toBe('mixto');
  });

  it('should have all four payment methods in MEDIOS_PAGO', () => {
    expect(MEDIOS_PAGO).toContain('mixto');
    expect(MEDIOS_PAGO).toContain('efectivo');
    expect(MEDIOS_PAGO).toContain('transferencia');
    expect(MEDIOS_PAGO).toContain('saldo_personal');
  });

  it('should have a label for mixto in MEDIO_PAGO_LABELS', () => {
    expect(MEDIO_PAGO_LABELS['mixto']).toBeDefined();
    expect(MEDIO_PAGO_LABELS['mixto']).toBe('Mixto');
  });
});

describe('CONCEPTOS_MANUALES_POR_TIPO', () => {
  const ingresos = CONCEPTOS_MANUALES_POR_TIPO[TipoMovimientoEnum.INGRESO];
  const egresos = CONCEPTOS_MANUALES_POR_TIPO[TipoMovimientoEnum.EGRESO];

  it('ofrece todos los conceptos de ingreso, no solo AJUSTE_INICIAL', () => {
    expect(ingresos).toEqual(
      expect.arrayContaining([
        ConceptoMovimiento.INSCRIPCION_GRUPO,
        ConceptoMovimiento.INSCRIPCION_SCOUT_ARGENTINA,
        ConceptoMovimiento.CAMPAMENTO_PAGO,
        ConceptoMovimiento.EVENTO_VENTA_INGRESO,
        ConceptoMovimiento.EVENTO_VENTA_RECUPERO_COSTO,
        ConceptoMovimiento.EVENTO_GRUPO_INGRESO,
        ConceptoMovimiento.ASIGNACION_FONDO_RAMA,
        ConceptoMovimiento.AJUSTE_INICIAL,
      ]),
    );
  });

  it('ofrece todos los conceptos de egreso', () => {
    expect(egresos).toEqual(
      expect.arrayContaining([
        ConceptoMovimiento.INSCRIPCION_PAGO_SCOUT_ARGENTINA,
        ConceptoMovimiento.CAMPAMENTO_GASTO,
        ConceptoMovimiento.EVENTO_VENTA_GASTO,
        ConceptoMovimiento.EVENTO_GRUPO_GASTO,
        ConceptoMovimiento.GASTO_GENERAL,
        ConceptoMovimiento.REEMBOLSO,
        ConceptoMovimiento.AJUSTE_INICIAL,
      ]),
    );
  });

  it('no mezcla tipos: ningún concepto de egreso aparece en ingreso y viceversa', () => {
    expect(ingresos).not.toContain(ConceptoMovimiento.GASTO_GENERAL);
    expect(ingresos).not.toContain(ConceptoMovimiento.CAMPAMENTO_GASTO);
    expect(egresos).not.toContain(ConceptoMovimiento.CAMPAMENTO_PAGO);
    expect(egresos).not.toContain(ConceptoMovimiento.EVENTO_GRUPO_INGRESO);
  });

  it('excluye los conceptos que siempre van en pareja ligada (transferencias, bonificaciones, uso de saldo)', () => {
    const ligados = [
      ConceptoMovimiento.TRANSFERENCIA_ENTRE_CAJAS,
      ConceptoMovimiento.TRANSFERENCIA_SALDO_PERSONAL,
      ConceptoMovimiento.BONIFICACION_OTORGADA,
      ConceptoMovimiento.BONIFICACION_RECIBIDA,
      ConceptoMovimiento.USO_SALDO_PERSONAL,
    ];
    for (const concepto of ligados) {
      expect(ingresos).not.toContain(concepto);
      expect(egresos).not.toContain(concepto);
    }
  });
});

describe('ConceptoMovimiento sin cuota de grupo', () => {
  it('no existe más el concepto cuota_grupo', () => {
    expect(Object.values(ConceptoMovimiento)).not.toContain('cuota_grupo');
  });
});

describe('ConceptoMovimiento', () => {
  it('incluye los conceptos de bonificación del fondo solidario', () => {
    expect(ConceptoMovimiento.BONIFICACION_OTORGADA).toBe('bonificacion_otorgada');
    expect(ConceptoMovimiento.BONIFICACION_RECIBIDA).toBe('bonificacion_recibida');
  });

  it('debe tener label para cada concepto (sin esto la tabla de movimientos muestra undefined)', () => {
    const labels = CONCEPTO_MOVIMIENTO_LABELS as Record<string, string>;
    for (const concepto of Object.values(ConceptoMovimiento)) {
      expect(labels[concepto as string]).toBeTruthy();
    }
  });
});

describe('CategoriaMovimiento', () => {
  it('debe tener las 8 categorias esperadas', () => {
    const values = Object.values(CategoriaMovimiento);
    expect(values).toContain('insumos');
    expect(values).toContain('comida');
    expect(values).toContain('transporte');
    expect(values).toContain('alquiler');
    expect(values).toContain('servicios');
    expect(values).toContain('material_didactico');
    expect(values).toContain('mantenimiento');
    expect(values).toContain('otros');
    expect(values.length).toBe(8);
  });

  it('debe tener label para cada categoria', () => {
    const labels = CATEGORIA_MOVIMIENTO_LABELS as Record<string, string>;
    for (const categoria of Object.values(CategoriaMovimiento)) {
      expect(labels[categoria as string]).toBeTruthy();
    }
  });
});
