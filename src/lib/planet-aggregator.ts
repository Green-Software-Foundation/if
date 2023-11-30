import {ERRORS} from '../util/errors';

import {CONFIG} from '../config';

import {ModelParams} from '../types/impl';
import {
  AggregationResult,
  PlanetAggregatorParams,
} from '../types/planet-aggregator';

const {InvalidAggregationParams} = ERRORS;

const {AVERAGE_NAMES} = CONFIG;

/**
 * Aggregates all the necessary values which are provided in `params`.
 */
export const planetAggregator = (
  inputs: ModelParams[],
  params: PlanetAggregatorParams
) => {
  const aggregationMetrics = params['aggregation-metrics'];
  const aggregationMethod = String(params['aggregation-method'] ?? 'sum');

  if (!aggregationMetrics) {
    throw new InvalidAggregationParams(
      'Aggregation metrics not parsed correctly. Please provide an array of strings.'
    );
  }

  return inputs.reduce((acc, input: ModelParams, index) => {
    for (const metric of aggregationMetrics) {
      if (!(metric in input)) {
        throw new InvalidAggregationParams(
          `Aggregation metric ${metric} is not found in inputs[${index}].`
        );
      }

      const accessKey = `aggregated-${metric}`;
      const value = parseFloat(input[metric]);
      acc[accessKey] = acc[accessKey] ?? 0;
      acc[accessKey] += value;

      if (index === inputs.length - 1) {
        if (AVERAGE_NAMES.includes(aggregationMethod)) {
          acc[accessKey] /= inputs.length;
        }
      }
    }

    return acc;
  }, {} as AggregationResult);
};
