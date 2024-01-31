import {ERRORS} from '../util/errors';
import {getAggregationMethod} from '../util/param-selectors';

import {STRINGS} from '../config';

import {ModelParams} from '../types/model-interface';
import {AggregationResult} from '../types/aggregator';
import {ParameterKey} from '../types/units';

const {InvalidAggregationParams} = ERRORS;
const {INVALID_AGGREGATION_METHOD, METRIC_MISSING} = STRINGS;

/**
 * Validates metrics array before applying aggregator.
 * If aggregation method is `none`, then throws error.
 */
const checkIfMetricsAreValid = (metrics: ParameterKey[]) => {
  metrics.forEach(metric => {
    const method = getAggregationMethod(metric);

    if (method === 'none') {
      throw new InvalidAggregationParams(INVALID_AGGREGATION_METHOD(method));
    }
  });
};

/**
 * Aggregates child node level metrics. Validates if metric aggregation type is `none`, then rejects with error.
 * Otherwise iterates over inputs by aggregating per given `metrics`.
 */
export const aggregate = (inputs: ModelParams[], metrics: ParameterKey[]) => {
  checkIfMetricsAreValid(metrics);

  return inputs.reduce((acc, input, index) => {
    for (const metric of metrics) {
      if (!(metric in input)) {
        throw new InvalidAggregationParams(METRIC_MISSING(metric, index));
      }

      const accessKey = `aggregated-${metric}`;
      acc[accessKey] = acc[accessKey] ?? 0;
      acc[accessKey] += parseFloat(input[metric]);

      /** Checks for the last iteration. */
      if (index === inputs.length - 1) {
        if (getAggregationMethod(metric) === 'avg') {
          acc[accessKey] /= inputs.length;
        }
      }
    }

    return acc;
  }, {} as AggregationResult);
};
