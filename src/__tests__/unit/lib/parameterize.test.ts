const mockLog = jest.fn();

jest.mock('../../../util/log-memoize', () => ({
  memoizedLog: mockLog,
}));

import {parameterize} from '../../../lib/parameterize';
import {ManifestParameter} from '../../../types/manifest';

describe('lib/parameterize: ', () => {
  describe('getAggregationMethod(): ', () => {
    it('returns method for average aggregation method metric.', () => {
      const metric = 'cpu/utilization';
      const method = parameterize.getAggregationMethod(metric);

      const expectedMethod = 'avg';

      expect(method).toEqual(expectedMethod);
    });

    it('returns method for unknown aggregation method metric.', () => {
      const metric = 'mock/metric';
      const method = parameterize.getAggregationMethod(metric);

      const expectedMethod = 'sum';

      expect(method).toEqual(expectedMethod);
      expect(mockLog).toHaveBeenCalledTimes(1);
    });
  });

  describe('combine(): ', () => {
    it('checks if return type is undefined.', () => {
      const params = {};
      const response = parameterize.combine(null, params);

      expect(response).toBeUndefined();
    });

    it('checks if uninitialized custom param is requested, then returns fallback `sum` method.', () => {
      const name = 'mock-name';
      const method = parameterize.getAggregationMethod(name);

      const expectedMethodName = 'sum';
      expect(method).toEqual(expectedMethodName);
    });

    it('checks if custom params are inserted successfully.', () => {
      const params = [
        {
          name: 'mock-name',
          description: 'mock-description',
          unit: 'mock/sq',
          aggregation: 'none',
        },
      ] as ManifestParameter[];
      const object = {};

      parameterize.combine(params, object);
      const method = parameterize.getAggregationMethod(params[0].name);

      expect(method).toEqual(params[0].aggregation);
    });
  });
});
