import {ERRORS} from '@grnsft/if-core/utils';
import {PluginParams} from '@grnsft/if-core/types';

import {aggregateInputsIntoOne} from '../../../util/aggregation-helper';

import {STRINGS} from '../../../config';

const {InvalidAggregationMethodError, MissingAggregationParamError} = ERRORS;
const {INVALID_AGGREGATION_METHOD, METRIC_MISSING} = STRINGS;

describe('util/aggregation-helper: ', () => {
  describe('aggregateInputsIntoOne(): ', () => {
    it('throws error if aggregation method is none.', () => {
      const inputs: PluginParams[] = [];
      const metrics: string[] = ['cpu/number-cores'];
      const isTemporal = false;

      expect.assertions(2);

      try {
        aggregateInputsIntoOne(inputs, metrics, isTemporal);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidAggregationMethodError);

        if (error instanceof InvalidAggregationMethodError) {
          expect(error.message).toEqual(INVALID_AGGREGATION_METHOD(metrics[0]));
        }
      }
    });

    it('throws error if aggregation criteria is not found in input.', () => {
      const inputs: PluginParams[] = [{timestamp: '', duration: 10}];
      const metrics: string[] = ['cpu/utilization'];
      const isTemporal = false;

      expect.assertions(2);

      try {
        aggregateInputsIntoOne(inputs, metrics, isTemporal);
      } catch (error) {
        expect(error).toBeInstanceOf(MissingAggregationParamError);

        if (error instanceof MissingAggregationParamError) {
          expect(error.message).toEqual(METRIC_MISSING(metrics[0], 0));
        }
      }
    });

    it('passes `timestamp`, `duration` to aggregator if aggregation is temporal.', () => {
      const inputs: PluginParams[] = [
        {timestamp: '', duration: 10, carbon: 10},
        {timestamp: '', duration: 10, carbon: 20},
      ];
      const metrics: string[] = ['carbon'];
      const isTemporal = true;

      const expectedValue = {
        timestamp: '',
        duration: 10,
        carbon: inputs[0].carbon + inputs[1].carbon,
      };
      const aggregated = aggregateInputsIntoOne(inputs, metrics, isTemporal);
      expect(aggregated).toEqual(expectedValue);
    });

    it('skips `timestamp`, `duration` if aggregation is not temporal.', () => {
      const inputs: PluginParams[] = [
        {timestamp: '', duration: 10, carbon: 10},
        {timestamp: '', duration: 10, carbon: 20},
      ];
      const metrics: string[] = ['carbon'];
      const isTemporal = false;

      const expectedValue = {
        carbon: inputs[0].carbon + inputs[1].carbon,
      };
      const aggregated = aggregateInputsIntoOne(inputs, metrics, isTemporal);
      expect(aggregated).toEqual(expectedValue);
    });

    it('calculates average of metrics.', () => {
      const inputs: PluginParams[] = [
        {timestamp: '', duration: 10, 'cpu/utilization': 10},
        {timestamp: '', duration: 10, 'cpu/utilization': 90},
      ];
      const metrics: string[] = ['cpu/utilization'];
      const isTemporal = false;

      const expectedValue = {
        'cpu/utilization':
          (inputs[0]['cpu/utilization'] + inputs[1]['cpu/utilization']) /
          inputs.length,
      };
      const aggregated = aggregateInputsIntoOne(inputs, metrics, isTemporal);
      expect(aggregated).toEqual(expectedValue);
      expect(aggregated.timestamp).toBeUndefined();
      expect(aggregated.duration).toBeUndefined();
    });
  });
});
