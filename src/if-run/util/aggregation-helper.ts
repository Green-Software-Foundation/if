import {ERRORS} from '@grnsft/if-core/utils';
import {PluginParams} from '@grnsft/if-core/types';

import {CONFIG, STRINGS} from '../config';

import {AggregationResult} from '../types/aggregation';

import {getAggregationInfoFor} from '../lib/aggregate';

const {MissingAggregationParamError} = ERRORS;
const {METRIC_MISSING} = STRINGS;
const {AGGREGATION_TIME_METRICS} = CONFIG;

/**
 * Aggregates child node level metrics. Appends aggregation additional params to metrics.
 * Otherwise iterates over inputs by aggregating per given `metrics`.
 */
export const aggregateInputsIntoOne = (
  inputs: PluginParams[],
  metrics: string[],
  isTemporal?: boolean
) => {
  const metricsWithTime = metrics.concat(AGGREGATION_TIME_METRICS);

  return inputs.reduce((acc, input, index) => {
    for (const metric of metricsWithTime) {
      if (!(metric in input)) {
        throw new MissingAggregationParamError(METRIC_MISSING(metric, index));
      }

      /** Checks if metric is timestamp or duration, then adds to aggregated value. */
      if (AGGREGATION_TIME_METRICS.includes(metric)) {
        if (isTemporal) {
          acc[metric] = input[metric];
        }
      } else {
        const aggregationParams = getAggregationInfoFor(metric);
        /** Checks either its a temporal aggregation (vertical), then chooses `component`, otherwise `time`.  */
        const aggregationType = isTemporal ? 'component' : 'time';

        if (aggregationParams[aggregationType] === 'none') {
          return acc;
        }

        if (aggregationParams[aggregationType] === 'copy') {
          acc[metric] = input[metric];
          return acc;
        }

        acc[metric] = acc[metric] ?? 0;
        acc[metric] += parseFloat(input[metric]);

        /** Checks for the last iteration. */
        if (index === inputs.length - 1) {
          if (aggregationParams[aggregationType] === 'avg') {
            acc[metric] /= inputs.length;
          }
        }
      }
    }

    return acc;
  }, {} as AggregationResult);
};
