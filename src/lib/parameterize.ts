import {logger} from '../util/logger';

import {STRINGS, PARAMETERS} from '../config';

import {ManifestParameter} from '../types/parameters';

const {REJECTING_OVERRIDE} = STRINGS;

/**
 * Parameters manager. Provides get aggregation method and combine functionality.
 */
const Parametrize = () => {
  let parametersStorage = {};

  /**
   * Returns aggregation method for given `unitName`. If doesn't exist then returns value `sum`.
   */
  const getAggregationMethod = (unitName: string) => {
    if (`${unitName}` in parametersStorage) {
      return PARAMETERS[unitName as keyof typeof PARAMETERS].aggregation;
    }

    return 'sum';
  };

  /**
   * Checks if additional parameters are provided in context.
   * If so, then checks if they are coincident with default ones and exits with warning message.
   * Otherwise appends context based parameters to defaults.
   */
  const combine = (
    contextParameters: ManifestParameter[] | null | undefined,
    parameters: any
  ) => {
    if (contextParameters) {
      contextParameters.forEach((param: any) => {
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
