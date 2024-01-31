import {parameters} from '../config/params';

import {ParameterKey} from '../types/units';

/**
 * Returns aggregation method for given `unitName`. If doesn't exist then returns value `sum`.
 */
export const getAggregationMethod = (unitName: ParameterKey) => {
  if (`${unitName}` in parameters) {
    return parameters[unitName].aggregation;
  }

  return 'sum';
};
