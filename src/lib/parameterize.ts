import {logger} from '../util/logger';
import {memoizedLog} from '../util/log-memoize';

import {STRINGS, PARAMETERS} from '../config';

import {ManifestParameter} from '../types/manifest';
import {Parameters} from '../types/parameters';

const {REJECTING_OVERRIDE, UNKNOWN_PARAM} = STRINGS;

/**
 * Parameters manager. Provides get aggregation method and combine functionality.
 */
const Parametrize = () => {
  let parametersStorage = PARAMETERS;

  /**
   * Returns aggregation method for given `unitName`. If doesn't exist then returns value `sum`.
   */
  const getAggregationMethod = (unitName: string) => {
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
    if (contextParameters) {
      contextParameters.forEach(param => {
        if (`${param.name}` in parameters) {
          logger.warn(REJECTING_OVERRIDE);

          return;
        }

        const {description, unit, aggregation, name} = param;

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

export const parameterize = Parametrize();
