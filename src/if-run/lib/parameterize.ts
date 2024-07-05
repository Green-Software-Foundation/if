import {debugLogger} from '../../common/util/debug-logger';
import {logger} from '../../common/util/logger';
import {memoizedLog} from '../util/log-memoize';

import {STRINGS, PARAMETERS} from '../config';

import {Parameters} from '../types/parameters';
import {ManifestParameter} from '../../common/types/manifest';

const {
  REJECTING_OVERRIDE,
  UNKNOWN_PARAM,
  SYNCING_PARAMETERS,
  CHECKING_AGGREGATION_METHOD,
} = STRINGS;

/**
 * Parameters manager. Provides get aggregation method and combine functionality.
 */
const Parameterize = () => {
  let parametersStorage = PARAMETERS;

  /**
   * Returns aggregation method for given `unitName`. If doesn't exist then returns value `sum`.
   */
  const getAggregationMethod = (unitName: string) => {
    debugLogger.setExecutingPluginName();
    memoizedLog(console.debug, CHECKING_AGGREGATION_METHOD(unitName));

    if (`${unitName}` in parametersStorage) {
      return parametersStorage[unitName as keyof typeof PARAMETERS].aggregation;
    }

    memoizedLog(logger.warn, UNKNOWN_PARAM(unitName));

    return 'sum';
  };

  /**
   * Checks if additional parameters are provided in context.
   * If so, then checks if they are coincident with default ones and exits with warning message.
   * Otherwise appends context based parameters to defaults.
   */
  const combine = (
    contextParameters: ManifestParameter[] | null | undefined,
    parameters: Parameters
  ) => {
    console.debug(SYNCING_PARAMETERS);

    if (contextParameters) {
      contextParameters.forEach(param => {
        if (`${param.name}` in parameters) {
          logger.warn(REJECTING_OVERRIDE(param));

          return;
        }

        const {description, unit, aggregation, name} = param;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        parameters[name] = {
          description,
          unit,
          aggregation,
        };
      });
    }

    parametersStorage = parameters;
  };

  return {
    combine,
    getAggregationMethod,
  };
};

export const parameterize = Parameterize();
