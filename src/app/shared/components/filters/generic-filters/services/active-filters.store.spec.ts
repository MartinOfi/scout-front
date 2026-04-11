import { TestBed } from '@angular/core/testing';
import { ActiveFilter } from '../active-filter.interface';
import { FilterOperator } from '../filter-operator.enum';
import { FilterType } from '../filter-type.enum';
import { ActiveFiltersStore } from './active-filters.store';

function buildFilter(override: Partial<ActiveFilter> = {}): ActiveFilter {
  return {
    key: 'status',
    type: FilterType.SELECT,
    label: 'Estado',
    operator: FilterOperator.IS,
    value: 'active',
    ...override,
  };
}

describe('ActiveFiltersStore', () => {
  let store: ActiveFiltersStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ActiveFiltersStore] });
    store = TestBed.inject(ActiveFiltersStore);
  });

  describe('initial state', () => {
    it('should start with an empty list', () => {
      expect(store.list()).toEqual([]);
    });

    it('should have hasActive=false when empty', () => {
      expect(store.hasActive()).toBe(false);
    });

    it('should have an empty valueMap when empty', () => {
      expect(store.valueMap()).toEqual({});
    });
  });

  describe('add', () => {
    it('should append a new filter', () => {
      store.add(buildFilter());
      expect(store.list().length).toBe(1);
      expect(store.list()[0].key).toBe('status');
    });

    it('should replace an existing filter with the same key', () => {
      store.add(buildFilter({ value: 'active' }));
      store.add(buildFilter({ value: 'inactive' }));
      expect(store.list().length).toBe(1);
      expect(store.list()[0].value).toBe('inactive');
    });

    it('should not mutate the previous list reference', () => {
      const before = store.list();
      store.add(buildFilter());
      expect(store.list()).not.toBe(before);
    });
  });

  describe('remove', () => {
    it('should remove a filter by key', () => {
      store.add(buildFilter({ key: 'status' }));
      store.add(buildFilter({ key: 'search', type: FilterType.TEXT, value: 'foo' }));
      store.remove('status');
      expect(store.list().length).toBe(1);
      expect(store.list()[0].key).toBe('search');
    });

    it('should be a no-op when the key does not exist', () => {
      store.add(buildFilter());
      store.remove('nope');
      expect(store.list().length).toBe(1);
    });
  });

  describe('updateValue', () => {
    it('should update the value of an existing filter', () => {
      store.add(buildFilter({ value: 'active' }));
      store.updateValue({ key: 'status', value: 'inactive' });
      expect(store.list()[0].value).toBe('inactive');
    });

    it('should keep operator and label unchanged', () => {
      store.add(buildFilter({ operator: FilterOperator.IS_NOT, label: 'Estado' }));
      store.updateValue({ key: 'status', value: 'x' });
      expect(store.list()[0].operator).toBe(FilterOperator.IS_NOT);
      expect(store.list()[0].label).toBe('Estado');
    });

    it('should be a no-op when the key does not exist', () => {
      store.updateValue({ key: 'nope', value: 'x' });
      expect(store.list()).toEqual([]);
    });
  });

  describe('updateOperator', () => {
    it('should update the operator of an existing filter', () => {
      store.add(buildFilter());
      store.updateOperator({ key: 'status', operator: FilterOperator.IS_NOT });
      expect(store.list()[0].operator).toBe(FilterOperator.IS_NOT);
    });
  });

  describe('clear', () => {
    it('should empty the list', () => {
      store.add(buildFilter());
      store.clear();
      expect(store.list()).toEqual([]);
      expect(store.hasActive()).toBe(false);
    });
  });

  describe('hydrate', () => {
    it('should replace the entire list with the given filters', () => {
      store.add(buildFilter({ key: 'search', type: FilterType.TEXT, value: 'x' }));
      store.hydrate([buildFilter({ key: 'status', value: 'active' })]);
      expect(store.list().length).toBe(1);
      expect(store.list()[0].key).toBe('status');
    });
  });

  describe('valueMap', () => {
    it('should project the active list into a key→value map', () => {
      store.add(buildFilter({ key: 'status', value: 'active' }));
      store.add(
        buildFilter({
          key: 'search',
          type: FilterType.TEXT,
          operator: FilterOperator.CONTAINS,
          value: 'foo',
        }),
      );
      expect(store.valueMap()).toEqual({ status: 'active', search: 'foo' });
    });
  });
});
