import {aggregateInputsIntoOne} from '../../../util/aggregation-helper';
import {ERRORS} from '../../../util/errors';

import {PluginParams} from '../../../types/interface';

const {InvalidAggregationParams} = ERRORS;

describe('util/aggregation-helper: ', () => {
  describe('aggregateInputsIntoOne(): ', () => {
    it('throws error if aggregation method is none.', () => {
      const inputs: PluginParams[] = [];
      const metrics: string[] = ['cpu/number-cores'];
      const isTemporal = false;

      expect.assertions(1);

      try {
        aggregateInputsIntoOne(inputs, metrics, isTemporal);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidAggregationParams);
      }
    });

    it('throws error if aggregation criteria is not found in input.', () => {
      const inputs: PluginParams[] = [{timestamp: '', duration: 10}];
      const metrics: string[] = ['cpu/utilization'];
      const isTemporal = false;

      expect.assertions(1);

      try {
        aggregateInputsIntoOne(inputs, metrics, isTemporal);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidAggregationParams);
      }
    });
  });
});
