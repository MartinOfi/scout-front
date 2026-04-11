import { FilterConfig } from '../filter-config.interface';
import { FilterType } from '../filter-type.enum';
import { buildFormControlSpecs } from './filter-form-builder.util';

describe('filter-form-builder.util', () => {
  describe('buildFormControlSpecs', () => {
    it('should return an empty list for no configs', () => {
      expect(buildFormControlSpecs([])).toEqual([]);
    });

    it('should build one spec per non-range filter config', () => {
      const configs: FilterConfig[] = [
        { key: 'search', type: FilterType.TEXT, label: 'Search' },
        { key: 'status', type: FilterType.SELECT, label: 'Status' },
      ];
      const specs = buildFormControlSpecs(configs);
      expect(specs.length).toBe(2);
      expect(specs[0].name).toBe('search');
      expect(specs[1].name).toBe('status');
    });

    it('should use the defaultValue when provided', () => {
      const configs: FilterConfig[] = [
        { key: 'status', type: FilterType.SELECT, label: 'Status', defaultValue: 'active' },
      ];
      const specs = buildFormControlSpecs(configs);
      expect(specs[0].defaultValue).toBe('active');
    });

    it('should fall back to empty string when defaultValue is missing', () => {
      const configs: FilterConfig[] = [
        { key: 'search', type: FilterType.TEXT, label: 'Search' },
      ];
      const specs = buildFormControlSpecs(configs);
      expect(specs[0].defaultValue).toBe('');
    });

    it('should expand DATE_RANGE into two specs (keyStart and keyEnd)', () => {
      const configs: FilterConfig[] = [
        { key: 'created', type: FilterType.DATE_RANGE, label: 'Creado' },
      ];
      const specs = buildFormControlSpecs(configs);
      expect(specs.length).toBe(2);
      expect(specs.map((s) => s.name)).toEqual(['createdStart', 'createdEnd']);
    });

    it('should seed DATE_RANGE specs from default startDate/endDate', () => {
      const configs: FilterConfig[] = [
        {
          key: 'created',
          type: FilterType.DATE_RANGE,
          label: 'Creado',
          defaultValue: { startDate: '2026-01-01', endDate: '2026-12-31' },
        },
      ];
      const specs = buildFormControlSpecs(configs);
      expect(specs[0].defaultValue).toBe('2026-01-01');
      expect(specs[1].defaultValue).toBe('2026-12-31');
    });

    it('should seed DATE_RANGE with empty strings when no defaultValue', () => {
      const configs: FilterConfig[] = [
        { key: 'created', type: FilterType.DATE_RANGE, label: 'Creado' },
      ];
      const specs = buildFormControlSpecs(configs);
      expect(specs[0].defaultValue).toBe('');
      expect(specs[1].defaultValue).toBe('');
    });
  });
});
