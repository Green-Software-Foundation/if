import {parameters} from '../config/params';

/**
 * Units dealer 😎 .
 */
export const UnitsDealer = async () => {
  return {
    /**
     * Returns aggregation method for given `unitName`. If doesn't exist then returns value `sum`.
     */
    askToGiveMethodFor: (unitName: string) => {
      if (Object.prototype.hasOwnProperty.call(parameters, unitName)) {
        return parameters[unitName as keyof typeof parameters].aggregation;
      }

      return 'sum';
    },
  };
};
