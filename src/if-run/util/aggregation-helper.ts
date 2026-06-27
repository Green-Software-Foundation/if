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

  type MedianBuckets = Record<string, number[]>;
  const medianBuckets: MedianBuckets = {};

  const result = outputs.reduce((acc, output, index) => {
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

        const method = aggregationParams[aggregationType] as
          | 'none'
          | 'copy'
          | 'sum'
          | 'avg'
          | 'min'
          | 'max'
          | 'median';

        if (aggregationParams[aggregationType] === 'none') {
          continue;
        }

        if (aggregationParams[aggregationType] === 'copy') {
          acc[metric] = output[metric];
          continue;
        }

        const n = Number(output[metric]);
        const value = Number.isFinite(n) ? n : 0;

        switch (method) {
          case 'median': {
            if (!medianBuckets[metric]) medianBuckets[metric] = [];
            medianBuckets[metric]!.push(value);
            break;
          }
          case 'min': {
            const cur = (acc[metric] as number) ?? Number.POSITIVE_INFINITY;
            acc[metric] = Math.min(cur, value);
            break;
          }
          case 'max': {
            const cur = (acc[metric] as number) ?? Number.NEGATIVE_INFINITY;
            acc[metric] = Math.max(cur, value);
            break;
          }
          case 'sum':
          case 'avg': {
            const cur = (acc[metric] as number) ?? 0;
            acc[metric] = cur + value;
            break;
          }
          default: {
            throw new Error(
              `Unsupported aggregation method: ${String(method)} for ${metric}`
            );
            break;
          }
        }

        /** Checks for the last iteration. */
        if (index === outputs.length - 1) {
          switch (method) {
            case 'avg': {
              acc[metric] /= outputs.length;
              break;
            }
            case 'median': {
              const arr = medianBuckets[metric] ?? [];
              if (arr.length === 0) {
                acc[metric] = 0;
              } else {
                arr.sort((a, b) => a - b);
                const mid = Math.floor(arr.length / 2);
                acc[metric] =
                  arr.length % 2 === 0
                    ? (arr[mid - 1] + arr[mid]) / 2
                    : arr[mid];
              }
              break;
            }
            default:
              break;
          }
        }
      }
    }

    return acc;
  }, {} as AggregationResult);
  return result;
};
