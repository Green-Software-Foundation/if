import {LeveledLogMethod} from 'winston';

const mockLog = jest.fn((message: string) => message);

jest.mock('../../../util/log-memoize', () => ({
  memoizedLog: mockLog,
}));
jest.mock('../../../util/logger', () => ({
  logger: {
    warn: mockLog,
    debug: mockLog,
  },
}));

import {PARAMETERS} from '../../../config';
import {parameterize} from '../../../lib/parameterize';

import {STRINGS} from '../../../config';

import {ManifestParameter} from '../../../types/manifest';

const {REJECTING_OVERRIDE, CHECKING_AGGREGATION_METHOD} = STRINGS;

describe('lib/parameterize: ', () => {
  afterEach(() => {
    (mockLog as jest.Mock).mockReset();
  });

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
      expect(mockLog as unknown as LeveledLogMethod).toHaveBeenCalledTimes(2);
    });

    it('prints debug log for first input.', () => {
      const unitName = 'timestamp';

      parameterize.getAggregationMethod(unitName);

      expect(mockLog as typeof console.debug).toHaveBeenCalledWith(
        console.debug,
        CHECKING_AGGREGATION_METHOD(unitName)
      );
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

    it('rejects on default param override.', () => {
      const params = [
        {
          name: 'carbon',
          description: 'mock-description',
          unit: 'mock/co',
          aggregation: 'none',
        },
      ] as ManifestParameter[];

      parameterize.combine(params, PARAMETERS);
      const method = parameterize.getAggregationMethod(params[0].name);

      const expectedMethodName = 'sum';
      const expectedMessage = REJECTING_OVERRIDE(params[0]);

      expect(method).toEqual(expectedMethodName);
      expect(mockLog).toHaveBeenCalledWith(expectedMessage);
    });
  });
});
