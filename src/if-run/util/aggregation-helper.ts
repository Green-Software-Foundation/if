import {ERRORS} from '@grnsft/if-core/utils';
import {PluginParams} from '@grnsft/if-core/types';

import {CONFIG, STRINGS} from '../config';

import {AggregationMetric, AggregationResult} from '../types/aggregation';

import {getAggregationMethod} from '../lib/aggregate';

const {MissingAggregationParamError} = ERRORS;
const {METRIC_MISSING} = STRINGS;
const {AGGREGATION_ADDITIONAL_PARAMS} = CONFIG;

/**
 * Aggregates child node level metrics. Appends aggregation additional params to metrics.
 * Otherwise iterates over inputs by aggregating per given `metrics`.
 */
export const aggregateInputsIntoOne = (
  inputs: PluginParams[],
  metrics: AggregationMetric[],
  isTemporal?: boolean
) => {
  const metricsKeys: string[] = metrics.map(metric => Object.keys(metric)[0]);
  const extendedMetrics = [...metricsKeys, ...AGGREGATION_ADDITIONAL_PARAMS];

  console.log(extendedMetrics);

  return inputs.reduce((acc, input, index) => {
    for (const metric of extendedMetrics) {
      if (!(metric in input)) {
        throw new MissingAggregationParamError(METRIC_MISSING(metric, index));
      }

      /** Checks if metric is timestamp or duration, then adds to aggregated value. */
      if (AGGREGATION_ADDITIONAL_PARAMS.includes(metric)) {
        if (isTemporal) {
          acc[metric] = input[metric];
        }
      } else {
        const method = getAggregationMethod(metric);

        if (method === 'none') {
          return acc;
        }

        if (method === 'copy') {
          acc[metric] = input[metric];
          return acc;
        }

        acc[metric] = acc[metric] ?? 0;
        acc[metric] += parseFloat(input[metric]);

        /** Checks for the last iteration. */
        if (index === inputs.length - 1) {
          if (method === 'avg') {
            acc[metric] /= inputs.length;
          }
        }
      }
    }

    return acc;
  }, {} as AggregationResult);
};
