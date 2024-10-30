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
 * Otherwise iterates over outputs by aggregating per given `metrics`.
 */
export const aggregateOutputsIntoOne = (
  outputs: PluginParams[],
  metrics: string[],
  isTemporal?: boolean
) => {
  const metricsWithTime = metrics.concat(AGGREGATION_TIME_METRICS);

  return outputs.reduce((acc, output, index) => {
    for (const metric of metricsWithTime) {
      if (!(metric in output)) {
        throw new MissingAggregationParamError(METRIC_MISSING(metric, index));
      }

      /** Checks if metric is timestamp or duration, then adds to aggregated value. */
      if (AGGREGATION_TIME_METRICS.includes(metric)) {
        if (isTemporal) {
          acc[metric] = output[metric];
        }
      } else {
        const aggregationParams = getAggregationInfoFor(metric);
        /** Checks either its a temporal aggregation (vertical), then chooses `component`, otherwise `time`.  */
        const aggregationType = isTemporal ? 'component' : 'time';

        if (aggregationParams[aggregationType] === 'none') {
          continue;
        }

        if (aggregationParams[aggregationType] === 'copy') {
          acc[metric] = output[metric];
          continue;
        }

        acc[metric] = acc[metric] ?? 0;
        acc[metric] += parseFloat(output[metric]);

        /** Checks for the last iteration. */
        if (index === outputs.length - 1) {
          if (aggregationParams[aggregationType] === 'avg') {
            acc[metric] /= outputs.length;
          }
        }
      }
    }

    return acc;
  }, {} as AggregationResult);
};
