import {ERRORS} from './errors';

import {STRINGS} from '../config';
import {logger} from './logger';
import {resolve} from 'path';

const {ISSUE_TEMPLATE} = STRINGS;

/**
 * Impact engine error handler. Logs errors and appends issue template if error is unknown.
 */
export const andHandle = (error: Error) => {
  const knownErrors = Object.keys(ERRORS);

  logger.error(error);

  if (!knownErrors.includes(error.name)) {
    logger.warn(ISSUE_TEMPLATE);
  }
};

/**
 * Mergers two objects, omitting null values.
 */
export const mergeObjects = (object1: any, object2: any) => {
  const merged: Record<string, any> = {};

  const keys1 = Object.keys(object1);
  keys1.forEach(key1 => {
    merged[key1] = object1[key1] || object2[key1];
  });

  const keys2 = Object.keys(object2);
  keys2.forEach(key2 => {
    if (!keys1.includes(key2)) {
      merged[key2] = object2[key2];
    }
  });

  return merged;
};

export const getPluginsDirectoryPath = () => {
  return resolve(__dirname, '../../../plugins');
};
