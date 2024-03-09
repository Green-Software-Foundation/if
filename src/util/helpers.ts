import {mergeWith} from 'lodash';

import {STRINGS} from '../config';
import {ERRORS} from './errors';
import {logger} from './logger';

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
 * Merge destination and source recursively.
 */
export const mergeObjects = (destination: any, source: any) => {
  const handleArrays = (objValue: any, srcValue: any) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      return srcValue;
    }
    return;
  };

  return mergeWith(destination, source, handleArrays);
};
