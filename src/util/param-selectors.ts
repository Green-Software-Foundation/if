import {PARAMETERS} from '../config';

/**
 * Returns aggregation method for given `unitName`. If doesn't exist then returns value `sum`.
 */
export const getAggregationMethod = (unitName: string) => {
  if (`${unitName}` in PARAMETERS) {
    return PARAMETERS[unitName].aggregation;
  }

  return 'sum';
};
