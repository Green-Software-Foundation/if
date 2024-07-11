import {ERRORS} from '@grnsft/if-core/utils';
import {PluginParams} from '@grnsft/if-core/types';

import {CONFIG, STRINGS} from '../config';

import {AggregationMetric, AggregationResult} from '../types/aggregation';

import {getAggregationMethod} from '../lib/aggregate';

const {InvalidAggregationMethodError, MissingAggregationParamError} = ERRORS;
const {INVALID_AGGREGATION_METHOD, METRIC_MISSING} = STRINGS;
const {AGGREGATION_ADDITIONAL_PARAMS} = CONFIG;

/**
 * Validates metrics array before applying aggregator.
 * If aggregation method is `none`, then throws error.
 */
const checkIfMetricsAreValid = (metrics: AggregationMetric) => {
  Object.keys(metrics).forEach(metric => {
    const method = metrics[metric].method;

    if (method === 'none') {
      throw new InvalidAggregationMethodError(
        INVALID_AGGREGATION_METHOD(metric)
      );
    }
  });
};

/**
 * Aggregates child node level metrics. Validates if metric aggregation type is `none`, then rejects with error.
 * Appends aggregation additional params to metrics. Otherwise iterates over inputs by aggregating per given `metrics`.
 */
export const aggregateInputsIntoOne = (
  inputs: PluginParams[],
  metrics: AggregationMetric,
  isTemporal?: boolean
) => {
  checkIfMetricsAreValid(metrics);
  const extendedMetrics = [
    ...Object.keys(metrics),
    ...AGGREGATION_ADDITIONAL_PARAMS,
  ];

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
        acc[metric] = acc[metric] ?? 0;
        acc[metric] += parseFloat(input[metric]);

        /** Checks for the last iteration. */
        if (index === inputs.length - 1) {
          if (getAggregationMethod(metric) === 'avg') {
            acc[metric] /= inputs.length;
          }
        }
      }
    }

    return acc;
  }, {} as AggregationResult);
};
