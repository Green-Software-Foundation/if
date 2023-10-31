import * as path from 'path';
import {parse} from 'ts-command-line-args';

import {checkIfFileIsYaml} from './yaml';

import {CONFIG, STRINGS} from '../config';

import {impactProcessArgs} from '../types/process-args';

const {impact} = CONFIG;
const {ARGS, HELP} = impact;

const {WRONG_CLI_ARGUMENT} = STRINGS;

/**
 * Validates process arguments
 * @private
 */
const validateAndParseProcessArgs = () => parse<impactProcessArgs>(ARGS);

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
  const {impl, ompl, help} = validateAndParseProcessArgs();

  if (help) {
    console.log(HELP);
    return;
  }

  if (impl) {
    if (checkIfFileIsYaml(impl)) {
      return {
        inputPath: prependFullFilePath(impl),
        ...(ompl && {outputPath: prependFullFilePath(ompl)}),
      };
    }
  }

  throw Error(WRONG_CLI_ARGUMENT);
};
