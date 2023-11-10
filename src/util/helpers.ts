import {ERRORS} from './errors';

import {STRINGS} from '../config';

const {ISSUE_TEMPLATE} = STRINGS;

/**
 * Impact engine error handler. Logs errors and appends issue template if error is unknown.
 */
export const andHandleWith = (issueTemplateURL: string) => (error: Error) => {
  const knownErrors = Object.keys(ERRORS);

  console.error(error);

  if (!knownErrors.includes(error.name)) {
    console.log(`${ISSUE_TEMPLATE}${issueTemplateURL}`);
  }
};
