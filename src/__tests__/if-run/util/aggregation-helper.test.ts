import {ERRORS} from '@grnsft/if-core/utils';
import {PluginParams} from '@grnsft/if-core/types';

import {AggregationParams} from '../../../common/types/manifest';

import {aggregateInputsIntoOne} from '../../../if-run/util/aggregation-helper';
import {AggregationMetric} from '../../../if-run/types/aggregation';
import {storeAggregationMetrics} from '../../../if-run/lib/aggregate';

import {STRINGS} from '../../../if-run/config';

const {InvalidAggregationMethodError, MissingAggregationParamError} = ERRORS;
const {INVALID_AGGREGATION_METHOD, METRIC_MISSING} = STRINGS;

describe('util/aggregation-helper: ', () => {
  beforeAll(() => {
    const metricStorage: AggregationParams = {
      metrics: {
        carbon: {method: 'sum'},
        'cpu/number-cores': {method: 'none'},
        'cpu/utilization': {method: 'sum'},
      },
      type: 'horizontal',
    };

    storeAggregationMetrics(metricStorage);
  });

  describe('aggregateInputsIntoOne(): ', () => {
    it('throws error if aggregation method is none.', () => {
      const inputs: PluginParams[] = [];
      const metrics: AggregationMetric = {'cpu/number-cores': {method: 'none'}};
      const isTemporal = false;

      expect.assertions(2);

      try {
        aggregateInputsIntoOne(inputs, metrics, isTemporal);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidAggregationMethodError);

        if (error instanceof InvalidAggregationMethodError) {
          expect(error.message).toEqual(
            INVALID_AGGREGATION_METHOD('cpu/number-cores')
          );
        }
      }
    });

    it('throws error if aggregation criteria is not found in input.', () => {
      const inputs: PluginParams[] = [{timestamp: '', duration: 10}];
      const metrics: AggregationMetric = {'cpu/utilization': {method: 'sum'}};
      const isTemporal = false;

      expect.assertions(2);

      try {
        aggregateInputsIntoOne(inputs, metrics, isTemporal);
      } catch (error) {
        expect(error).toBeInstanceOf(MissingAggregationParamError);

        if (error instanceof MissingAggregationParamError) {
          expect(error.message).toEqual(METRIC_MISSING('cpu/utilization', 0));
        }
      }
    });

    it('passes `timestamp`, `duration` to aggregator if aggregation is temporal.', () => {
      const inputs: PluginParams[] = [
        {timestamp: '', duration: 10, carbon: 10},
        {timestamp: '', duration: 10, carbon: 20},
      ];
      const metrics: AggregationMetric = {carbon: {method: 'sum'}};
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
      const metrics: AggregationMetric = {carbon: {method: 'sum'}};
      const isTemporal = false;

      const expectedValue = {
        carbon: inputs[0].carbon + inputs[1].carbon,
      };
      const aggregated = aggregateInputsIntoOne(inputs, metrics, isTemporal);
      expect(aggregated).toEqual(expectedValue);
    });

    it('calculates average of metrics.', () => {
      const metricStorage: AggregationParams = {
        metrics: {
          'cpu/utilization': {method: 'avg'},
        },
        type: 'horizontal',
      };

      storeAggregationMetrics(metricStorage);
      const inputs: PluginParams[] = [
        {timestamp: '', duration: 10, 'cpu/utilization': 10},
        {timestamp: '', duration: 10, 'cpu/utilization': 90},
      ];
      const metrics: AggregationMetric = {'cpu/utilization': {method: 'avg'}};
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
