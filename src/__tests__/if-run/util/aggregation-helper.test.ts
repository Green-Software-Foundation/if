import {AGGREGATION_METHODS} from '@grnsft/if-core/consts';
import {ERRORS} from '@grnsft/if-core/utils';
import {PluginParams} from '@grnsft/if-core/types';

import {AggregationParams} from '../../../common/types/manifest';

import {aggregateInputsIntoOne} from '../../../if-run/util/aggregation-helper';
import {storeAggregationMetrics} from '../../../if-run/lib/aggregate';

import {STRINGS} from '../../../if-run/config';

const {MissingAggregationParamError} = ERRORS;
const {METRIC_MISSING} = STRINGS;

describe('util/aggregation-helper: ', () => {
  beforeAll(() => {
    const metricStorage: AggregationParams = {
      metrics: ['carbon', 'cpu/number-cores', 'cpu/utilization'],
      type: 'horizontal',
    };
    const convertedMetrics = metricStorage.metrics.map((metric: string) => ({
      [metric]: {
        time: AGGREGATION_METHODS[2],
        component: AGGREGATION_METHODS[2],
      },
    }));
    storeAggregationMetrics(...convertedMetrics);
    storeAggregationMetrics({
      carbon: {
        time: 'sum',
        component: 'sum',
      },
    });
  });

  describe('aggregateInputsIntoOne(): ', () => {
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
          expect(error.message).toEqual(METRIC_MISSING('cpu/utilization', 0));
        }
      }
    });

    it('passes `timestamp`, `duration` to aggregator if aggregation is temporal.', () => {
      storeAggregationMetrics({
        carbon: {
          time: 'sum',
          component: 'sum',
        },
      });
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
      const metricStorage: AggregationParams = {
        metrics: ['cpu/utilization'],
        type: 'horizontal',
      };
      const convertedMetrics = metricStorage.metrics.map((metric: string) => ({
        [metric]: {
          time: AGGREGATION_METHODS[2],
          component: AGGREGATION_METHODS[2],
        },
      }));
      storeAggregationMetrics(...convertedMetrics);
      storeAggregationMetrics({
        'cpu/utilization': {
          time: 'avg',
          component: 'avg',
        },
      });

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
