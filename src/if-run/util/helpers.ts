import {ERRORS} from '@grnsft/if-core/utils';

import {logger} from '../../common/util/logger';
import {GlobalPlugins} from '../../common/types/manifest';
import {PluginStorageInterface} from '../types/plugin-storage';
import {storeAggregationMetrics} from '../lib/aggregate';

import {STRINGS} from '../config';

const {UNSUPPORTED_ERROR} = STRINGS;

/**
 * Impact engine error handler. Logs errors and appends issue template if error is unknown.
 */
export const andHandle = (error: Error) => {
  const knownErrors = Object.keys(ERRORS);

  logger.error(error);

  if (!knownErrors.includes(error.name)) {
    logger.error(UNSUPPORTED_ERROR(error.name));
    // eslint-disable-next-line no-process-exit
    process.exit(2);
  }
};

/**
 * Append entries from defaults which are missing from inputs.
 */
export const mergeObjects = (defaults: any, input: any) => {
  const merged: Record<string, any> = structuredClone(input);

  for (const key in defaults) {
    if (!(key in input)) {
      merged[key] = defaults[key];
    }

    if (merged[key] === undefined || merged[key] === null) {
      merged[key] = defaults[key];
    }
  }

  return merged;
};

/**
 * Stores `'aggregation-method'` of the plugins in the pipeline.
 */
export const storeAggregationMethods = (
  plugins: GlobalPlugins,
  pluginStorage: PluginStorageInterface
) => {
  Object.keys(plugins).forEach(pluginName => {
    const plugin = pluginStorage.get(pluginName);

    if ('inputs' in plugin.metadata || 'outputs' in plugin.metadata) {
      const pluginParameters =
        {...plugin.metadata.inputs, ...plugin.metadata.outputs} || {};

      Object.entries(pluginParameters).forEach(
        ([parameterName, parameterMetadata]) => {
          const {'aggregation-method': aggregationMethod} = parameterMetadata;

          if (aggregationMethod) {
            const metrics = {[parameterName]: aggregationMethod};

            storeAggregationMetrics(metrics);
          }
        }
      );
    }
  });
};
