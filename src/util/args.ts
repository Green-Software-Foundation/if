import * as path from 'path';
import {parse} from 'ts-command-line-args';

import {checkIfFileIsYaml} from './yaml';

import {CONFIG, STRINGS} from '../config';

import {ImplProcessArgs} from '../types/process-args';

const {VALIDATION} = CONFIG;
const {IMPL_CLI} = VALIDATION;

const {WRONG_CLI_ARGUMENT} = STRINGS;

/**
 * Validates process arguments
 * @private
 */
const validateAndParseProcessArgs = () => parse<ImplProcessArgs>(IMPL_CLI);

/**
 * Prepends process path to fiven `filePath`.
 * @private
 */
const prependFullFilePath = (filePath: string) => {
  const processRunningPath = process.cwd();

  return path.normalize(`${processRunningPath}/${filePath}`);
};

/**
 * Parses process argument, if it's `yaml` file, then returns it.
 * Otherwise throws error.
 */
export const parseProcessArgument = () => {
  const {impl, ompl} = validateAndParseProcessArgs();

  if (checkIfFileIsYaml(impl)) {
    return {
      inputPath: prependFullFilePath(impl),
      ...(ompl && {outputPath: prependFullFilePath(ompl)}),
    };
  }

  throw Error(WRONG_CLI_ARGUMENT);
};
