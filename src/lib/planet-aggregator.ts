import {ERRORS} from '../util/errors';

import {ModelParams} from '../types/impl';
import {
  AggregationResult,
  PlanetAggregatorParams,
} from '../types/planet-aggregator';

const {InvalidAggregationParams} = ERRORS;

/**
 * Aggregates child node level metrics. Uses provided aggregation `params`.
 */
export const planetAggregator = (
  inputs: ModelParams[],
  params: PlanetAggregatorParams
) => {
  if (
    !params['aggregation-metrics'] ||
    params['aggregation-metrics'].length === 0
  ) {
    throw new InvalidAggregationParams(
      'Provided aggregation metrics are invalid. Please provide an array of strings.'
    );
  }

  const aggregationMetrics = params['aggregation-metrics'];
  const aggregationMethod = params['aggregation-method'];

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
        if (aggregationMethod === 'avg') {
          acc[accessKey] /= inputs.length;
        }
      }
    }

    return acc;
  }, {} as AggregationResult);
};
