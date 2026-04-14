import {
  MedioPagoEnum,
  MEDIOS_PAGO,
  MEDIO_PAGO_LABELS,
  CONCEPTOS_CREABLES_MANUALMENTE,
  ConceptoMovimiento,
  CategoriaMovimiento,
  CATEGORIA_MOVIMIENTO_LABELS,
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

describe('CONCEPTOS_CREABLES_MANUALMENTE', () => {
  it('debe incluir GASTO_GENERAL', () => {
    expect(CONCEPTOS_CREABLES_MANUALMENTE).toContain(ConceptoMovimiento.GASTO_GENERAL);
  });

  it('debe incluir AJUSTE_INICIAL', () => {
    expect(CONCEPTOS_CREABLES_MANUALMENTE).toContain(ConceptoMovimiento.AJUSTE_INICIAL);
  });

  it('no debe incluir conceptos de sistema', () => {
    expect(CONCEPTOS_CREABLES_MANUALMENTE).not.toContain(ConceptoMovimiento.CUOTA_GRUPO);
    expect(CONCEPTOS_CREABLES_MANUALMENTE).not.toContain(ConceptoMovimiento.INSCRIPCION_GRUPO);
    expect(CONCEPTOS_CREABLES_MANUALMENTE).not.toContain(ConceptoMovimiento.CAMPAMENTO_PAGO);
    expect(CONCEPTOS_CREABLES_MANUALMENTE).not.toContain(ConceptoMovimiento.EVENTO_VENTA_INGRESO);
    expect(CONCEPTOS_CREABLES_MANUALMENTE).not.toContain(ConceptoMovimiento.REEMBOLSO);
  });

  it('debe tener exactamente 2 entradas', () => {
    expect(CONCEPTOS_CREABLES_MANUALMENTE.length).toBe(2);
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
