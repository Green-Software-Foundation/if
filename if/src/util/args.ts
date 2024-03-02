import * as path from 'path';

import {checkIfFileIsYaml} from './yaml';
import {ERRORS} from './errors';

import {STRINGS} from '../config';

const {CliInputError} = ERRORS;

const {FILE_IS_NOT_YAML} = STRINGS;

/**
 * Prepends process path to given `filePath`.
 */
const prependFullFilePath = (filePath: string) => {
  const processRunningPath = process.cwd();

  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  return path.normalize(`${processRunningPath}/${filePath}`);
};

/**
 * 1. Checks if `manifest` is a `yaml` file, then returns it.
 *    If it is, then returns object containing full path.
 * 2. If params are missing or invalid, then rejects with `CliInputError`.
 */
export const validateOptions = (
  manifest: string,
  output: string | undefined,
  overrideParams: string | undefined
) => {
  if (checkIfFileIsYaml(manifest)) {
    return {
      inputPath: prependFullFilePath(manifest),
      ...(output && {outputPath: prependFullFilePath(output)}),
      ...(overrideParams && {paramPath: overrideParams}),
    };
  }

  throw new CliInputError(FILE_IS_NOT_YAML);
};
