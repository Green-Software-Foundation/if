import {ERRORS} from './errors';

import {STRINGS} from '../config';
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
