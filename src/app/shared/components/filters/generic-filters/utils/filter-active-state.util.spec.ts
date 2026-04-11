import { DateRangeValue } from '../filter-value.type';
import { countActive, hasActiveValue } from './filter-active-state.util';

describe('filter-active-state.util', () => {
  describe('hasActiveValue', () => {
    it('should return false for null, undefined, empty string and false', () => {
      expect(hasActiveValue(null)).toBe(false);
      expect(hasActiveValue(undefined)).toBe(false);
      expect(hasActiveValue('')).toBe(false);
      expect(hasActiveValue(false)).toBe(false);
    });

    it('should return true for non-empty strings, numbers and true', () => {
      expect(hasActiveValue('hello')).toBe(true);
      expect(hasActiveValue(0)).toBe(true);
      expect(hasActiveValue(42)).toBe(true);
      expect(hasActiveValue(true)).toBe(true);
    });

    it('should return false for empty arrays', () => {
      expect(hasActiveValue([])).toBe(false);
    });

    it('should return true for non-empty arrays', () => {
      expect(hasActiveValue(['a'])).toBe(true);
      expect(hasActiveValue([1, 2])).toBe(true);
    });

    it('should return false for a date range with no dates', () => {
      const range: DateRangeValue = { startDate: null, endDate: null };
      expect(hasActiveValue(range)).toBe(false);
    });

    it('should return true for a date range with startDate only', () => {
      const range: DateRangeValue = { startDate: '2026-01-01', endDate: null };
      expect(hasActiveValue(range)).toBe(true);
    });

    it('should return true for a date range with endDate only', () => {
      const range: DateRangeValue = { startDate: null, endDate: '2026-12-31' };
      expect(hasActiveValue(range)).toBe(true);
    });
  });

  describe('countActive', () => {
    it('should return 0 for an empty filter map', () => {
      expect(countActive({})).toBe(0);
    });

    it('should count only truly active values', () => {
      const filters = {
        search: 'hello',
        status: '',
        tags: ['a', 'b'],
        empty: null,
        bool: false,
        range: { startDate: '2026-01-01', endDate: null },
      };
      expect(countActive(filters)).toBe(3);
    });
  });
});
