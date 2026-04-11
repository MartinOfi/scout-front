import { FilterOperator } from '../filter-operator.enum';
import {
  FILTER_LABELS,
  FILTER_OPERATOR_LABELS,
  buildActiveCountLabel,
  getOperatorLabel,
} from './filter-labels.config';

describe('filter-labels.config', () => {
  describe('FILTER_LABELS', () => {
    it('should expose the trigger and clear labels', () => {
      expect(FILTER_LABELS.triggerButton).toBeTruthy();
      expect(FILTER_LABELS.clearAll).toBeTruthy();
    });

    it('should expose every required accessibility label', () => {
      expect(FILTER_LABELS.openFiltersAria).toBeTruthy();
      expect(FILTER_LABELS.noResults).toBeTruthy();
      expect(FILTER_LABELS.searchPlaceholder).toBeTruthy();
    });

    it('should expose date range placeholders and unsupported-type label', () => {
      expect(FILTER_LABELS.dateRangeStartPlaceholder).toBeTruthy();
      expect(FILTER_LABELS.dateRangeEndPlaceholder).toBeTruthy();
      expect(FILTER_LABELS.unsupportedType).toBeTruthy();
    });
  });

  describe('FILTER_OPERATOR_LABELS', () => {
    it('should provide a label for every FilterOperator', () => {
      Object.values(FilterOperator).forEach((op) => {
        expect(FILTER_OPERATOR_LABELS[op], `op=${op}`).toBeTruthy();
      });
    });
  });

  describe('getOperatorLabel', () => {
    it('should return the Spanish label for a known operator', () => {
      expect(getOperatorLabel(FilterOperator.IS)).toBe(FILTER_OPERATOR_LABELS[FilterOperator.IS]);
    });
  });

  describe('buildActiveCountLabel', () => {
    it('should use singular form for 1 filter', () => {
      expect(buildActiveCountLabel(1)).toContain('filtro');
      expect(buildActiveCountLabel(1)).not.toContain('filtros');
    });

    it('should use plural form for 2+ filters', () => {
      expect(buildActiveCountLabel(2)).toContain('filtros');
      expect(buildActiveCountLabel(5)).toContain('filtros');
    });

    it('should include the count number', () => {
      expect(buildActiveCountLabel(3)).toContain('3');
    });
  });
});
