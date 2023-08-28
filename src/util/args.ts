import {checkIfFileIsYaml} from './yaml';

import {STRINGS} from '../config';

const {WRONG_CLI_ARGUMENT} = STRINGS;

/**
 * Parses process argument, if it's `yaml` file, then returns it.
 * Otherwise throws error.
 */
export const parseProcessArgument = () => {
  const lastArgIndex = process.argv.length - 1;
  const path = process.argv[lastArgIndex];

  if (checkIfFileIsYaml(path)) {
    return path;
  }

  throw Error(WRONG_CLI_ARGUMENT);
};
