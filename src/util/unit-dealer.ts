import path = require('path');

import {openYamlFileAsObject} from './yaml';

import {Units, UnitKeyName} from '../types/units';

/**
 * Gets units file as an object.
 */
const getUnitsFile = () =>
  openYamlFileAsObject<Units>(
    path.normalize(`${__dirname}/../config/units.yaml`)
  );

/**
 * Units dealer 😎 🃏.
 */
export const UnitsDealer = async () => {
  const unitsStack = await getUnitsFile();

  return {
    askToGiveUnitFor: (unitName: UnitKeyName) => {
      if (unitsStack[unitName]) {
        return unitsStack[unitName].unit;
      }

      return 'sum';
    },
  };
};
