import { FilterOperator } from '../filter-operator.enum';
import { FilterType } from '../filter-type.enum';
import {
  FILTER_OPERATORS_BY_TYPE,
  getDefaultOperator,
  isOperatorValidForType,
} from './filter-operators.config';

describe('filter-operators.config', () => {
  describe('FILTER_OPERATORS_BY_TYPE', () => {
    it('should map every FilterType to at least one operator', () => {
      Object.values(FilterType).forEach((type) => {
        const operators = FILTER_OPERATORS_BY_TYPE[type];
        expect(operators).toBeDefined();
        expect(operators.length).toBeGreaterThan(0);
      });
    });

    it('should use only valid FilterOperator values', () => {
      const validOperators = new Set<string>(Object.values(FilterOperator));
      Object.entries(FILTER_OPERATORS_BY_TYPE).forEach(([, operators]) => {
        operators.forEach((op) => {
          expect(validOperators.has(op)).toBe(true);
        });
      });
    });

    it('should give SELECT the IS and IS_NOT operators', () => {
      const selectOps = FILTER_OPERATORS_BY_TYPE[FilterType.SELECT];
      expect(selectOps).toContain(FilterOperator.IS);
      expect(selectOps).toContain(FilterOperator.IS_NOT);
    });

    it('should give DATE_RANGE the BETWEEN operator', () => {
      expect(FILTER_OPERATORS_BY_TYPE[FilterType.DATE_RANGE]).toContain(FilterOperator.BETWEEN);
    });

    it('should give TEXT the CONTAINS and NOT_CONTAINS operators', () => {
      const textOps = FILTER_OPERATORS_BY_TYPE[FilterType.TEXT];
      expect(textOps).toContain(FilterOperator.CONTAINS);
      expect(textOps).toContain(FilterOperator.NOT_CONTAINS);
    });
  });

  describe('getDefaultOperator', () => {
    it('should return the first operator of the type', () => {
      const first = FILTER_OPERATORS_BY_TYPE[FilterType.NUMBER][0];
      expect(getDefaultOperator(FilterType.NUMBER)).toBe(first);
    });

    it('should return a valid operator for every FilterType', () => {
      Object.values(FilterType).forEach((type) => {
        const op = getDefaultOperator(type);
        expect(FILTER_OPERATORS_BY_TYPE[type]).toContain(op);
      });
    });
  });

  describe('isOperatorValidForType', () => {
    it('should return true for valid operator/type combinations', () => {
      expect(
        isOperatorValidForType({ type: FilterType.SELECT, operator: FilterOperator.IS }),
      ).toBe(true);
    });

    it('should return false for invalid operator/type combinations', () => {
      expect(
        isOperatorValidForType({ type: FilterType.BOOLEAN, operator: FilterOperator.BETWEEN }),
      ).toBe(false);
    });
  });
});
