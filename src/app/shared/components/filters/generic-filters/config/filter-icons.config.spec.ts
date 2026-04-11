import { FilterType } from '../filter-type.enum';
import { FILTER_ICONS_BY_TYPE, getIconForType } from './filter-icons.config';

describe('filter-icons.config', () => {
  it('should provide an icon for every FilterType', () => {
    Object.values(FilterType).forEach((type) => {
      const icon = FILTER_ICONS_BY_TYPE[type];
      expect(icon, `type=${type}`).toBeTruthy();
      expect(typeof icon).toBe('string');
    });
  });

  it('should return non-empty strings via getIconForType', () => {
    Object.values(FilterType).forEach((type) => {
      expect(getIconForType(type).length, `type=${type}`).toBeGreaterThan(0);
    });
  });

  it('should give DATE_RANGE a distinct icon from DATE', () => {
    expect(FILTER_ICONS_BY_TYPE[FilterType.DATE]).not.toBe(
      FILTER_ICONS_BY_TYPE[FilterType.DATE_RANGE],
    );
  });
});
