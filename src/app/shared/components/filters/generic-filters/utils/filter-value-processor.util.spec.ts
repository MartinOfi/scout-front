import { FilterConfig } from '../filter-config.interface';
import { FilterType } from '../filter-type.enum';
import { processFormValue } from './filter-value-processor.util';

describe('filter-value-processor.util', () => {
  describe('processFormValue', () => {
    it('should return an empty object when given no configs', () => {
      const result = processFormValue({ configs: [], formValue: {} });
      expect(result).toEqual({});
    });

    it('should pass scalar values through for non-range types', () => {
      const configs: FilterConfig[] = [
        { key: 'search', type: FilterType.TEXT, label: 'Search' },
        { key: 'status', type: FilterType.SELECT, label: 'Status' },
      ];
      const result = processFormValue({
        configs,
        formValue: { search: 'hello', status: 'active' },
      });
      expect(result).toEqual({ search: 'hello', status: 'active' });
    });

    it('should collapse DATE_RANGE controls into a single key with { startDate, endDate }', () => {
      const configs: FilterConfig[] = [
        { key: 'created', type: FilterType.DATE_RANGE, label: 'Creado' },
      ];
      const result = processFormValue({
        configs,
        formValue: { createdStart: '2026-01-01', createdEnd: '2026-12-31' },
      });
      expect(result).toEqual({
        created: { startDate: '2026-01-01', endDate: '2026-12-31' },
      });
    });

    it('should omit DATE_RANGE key when both dates are empty', () => {
      const configs: FilterConfig[] = [
        { key: 'created', type: FilterType.DATE_RANGE, label: 'Creado' },
      ];
      const result = processFormValue({
        configs,
        formValue: { createdStart: '', createdEnd: '' },
      });
      expect(result).toEqual({});
    });

    it('should include DATE_RANGE key when only startDate is set', () => {
      const configs: FilterConfig[] = [
        { key: 'created', type: FilterType.DATE_RANGE, label: 'Creado' },
      ];
      const result = processFormValue({
        configs,
        formValue: { createdStart: '2026-01-01', createdEnd: '' },
      });
      expect(result).toEqual({
        created: { startDate: '2026-01-01', endDate: null },
      });
    });

    it('should handle a mix of scalar and range filters', () => {
      const configs: FilterConfig[] = [
        { key: 'search', type: FilterType.TEXT, label: 'Search' },
        { key: 'created', type: FilterType.DATE_RANGE, label: 'Creado' },
      ];
      const result = processFormValue({
        configs,
        formValue: { search: 'foo', createdStart: '2026-01-01', createdEnd: null },
      });
      expect(result).toEqual({
        search: 'foo',
        created: { startDate: '2026-01-01', endDate: null },
      });
    });

    it('should preserve array values (multi-select)', () => {
      const configs: FilterConfig[] = [
        { key: 'tags', type: FilterType.MULTI_SELECT, label: 'Tags' },
      ];
      const result = processFormValue({
        configs,
        formValue: { tags: ['a', 'b'] },
      });
      expect(result).toEqual({ tags: ['a', 'b'] });
    });
  });
});
