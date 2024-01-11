import {ERRORS} from '../util/errors';
import {UnitsDealer} from '../util/units-dealer';

import {STRINGS} from '../config';

import {ModelParams} from '../types/model-interface';
import {AggregationResult} from '../types/planet-aggregator';
import {UnitKeyName} from '../types/units';
import {UnitsDealerUsage} from '../types/units-dealer';

const {InvalidAggregationParams} = ERRORS;
const {INVALID_AGGREGATION_METHOD, METRIC_MISSING} = STRINGS;

/**
 * Validates metrics array before applying aggregator.
 * If aggregation method is `none`, then throws error.
 */
const checkIfMetricsAreValid = (
  metrics: UnitKeyName[],
  dealer: UnitsDealerUsage
) => {
  metrics.forEach(metric => {
    const method = dealer.askToGiveMethodFor(metric);

    if (method === 'none') {
      throw new InvalidAggregationParams(INVALID_AGGREGATION_METHOD(method));
    }
  });
};

/**
 * Aggregates child node level metrics. If metrics arr
 */
export const planetAggregator = async (
  inputs: ModelParams[],
  metrics: UnitKeyName[]
) => {
  const dealer = await UnitsDealer();

  checkIfMetricsAreValid(metrics, dealer);

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
        if (dealer.askToGiveMethodFor(metric) === 'avg') {
          acc[accessKey] /= inputs.length;
        }
      }
    }

    return acc;
  }, {} as AggregationResult);
};
