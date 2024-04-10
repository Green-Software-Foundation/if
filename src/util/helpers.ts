import {STRINGS} from '../config';
import {ERRORS} from './errors';
import {Logger} from './logger';

const {ISSUE_TEMPLATE} = STRINGS;

/**
 * Impact engine error handler. Logs errors and appends issue template if error is unknown.
 */
export const andHandle = (error: Error) => {
  const knownErrors = Object.keys(ERRORS);

  if (error.name === 'PluginError') {
    return;
  }

  const logger = Logger('Plugin');
  logger.error(error);

  if (!knownErrors.includes(error.name)) {
    logger.warn(ISSUE_TEMPLATE);
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
