import {
  MedioPagoEnum,
  MEDIOS_PAGO,
  MEDIO_PAGO_LABELS,
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
