import {getAggregationMethod} from '../../../util/param-selectors';

describe('util/param-selector: ', () => {
  describe('getAggregationMethod(): ', () => {
    it('check if `sum` is returned for non existant unit.', () => {
      const nonExistantMetric = 'mock';
      const expectedResult = 'sum';

      expect(getAggregationMethod(nonExistantMetric)).toBe(expectedResult);
    });

    it('returns aggregation method for `cpu-util`.', () => {
      const metric = 'cpu-util';
      const expectedResult = 'avg';

      expect(getAggregationMethod(metric)).toBe(expectedResult);
    });
  });
});
