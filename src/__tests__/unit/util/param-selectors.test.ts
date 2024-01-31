import {ParameterKey} from '../../../types/units';
import {getAggregationMethod} from '../../../util/param-selectors';

describe('util/param-selector: ', () => {
  describe('getAggregationMethod(): ', () => {
    it('check if `sum` is returned for non existant unit.', () => {
      const nonExistantMetric = 'mock' as ParameterKey;
      const expectedResult = 'sum';

      expect(getAggregationMethod(nonExistantMetric)).toBe(expectedResult);
    });

    it('returns aggregation method for `cpu-util`.', () => {
      const metric = 'cpu-util' as ParameterKey;
      const expectedResult = 'avg';

      expect(getAggregationMethod(metric)).toBe(expectedResult);
    });
  });
});
