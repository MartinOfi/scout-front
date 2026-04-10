import { MoneyPipe, formatMoney } from './money.pipe';

/**
 * Tests for MoneyPipe.
 *
 * Note: all expected strings use non-breaking space (U+00A0) between the
 * currency symbol and the number, which is what Intl.NumberFormat emits
 * under the 'es-AR' locale for currency style. If these tests fail with a
 * "visually identical" mismatch, check that the expected string uses \u00A0
 * and not a regular space.
 */
describe('MoneyPipe', () => {
  let pipe: MoneyPipe;

  beforeEach(() => {
    pipe = new MoneyPipe();
  });

  it('formats large integers with thousands separators (es-AR)', () => {
    expect(pipe.transform(1234567)).toBe('$\u00A01.234.567');
  });

  it('formats small integers', () => {
    expect(pipe.transform(1000)).toBe('$\u00A01.000');
  });

  it('formats zero as "$ 0" (zero is NOT empty)', () => {
    expect(pipe.transform(0)).toBe('$\u00A00');
  });

  it('rounds decimals when using 0 decimals (default)', () => {
    expect(pipe.transform(1234.56)).toBe('$\u00A01.235');
  });

  it('formats with 2 decimals when requested', () => {
    expect(pipe.transform(1234.5, 2)).toBe('$\u00A01.234,50');
  });

  it('formats negative values', () => {
    expect(pipe.transform(-1500)).toBe('-$\u00A01.500');
  });

  it('returns "-" for null', () => {
    expect(pipe.transform(null)).toBe('-');
  });

  it('returns "-" for undefined', () => {
    expect(pipe.transform(undefined)).toBe('-');
  });

  it('returns "-" for NaN', () => {
    expect(pipe.transform(Number.NaN)).toBe('-');
  });

  it('accepts custom placeholder for empty values', () => {
    expect(pipe.transform(null, 0, '—')).toBe('—');
  });
});

describe('formatMoney utility', () => {
  it('mirrors the pipe behavior', () => {
    expect(formatMoney(1234567)).toBe('$\u00A01.234.567');
    expect(formatMoney(null)).toBe('-');
    expect(formatMoney(1234.5, 2)).toBe('$\u00A01.234,50');
  });
});
