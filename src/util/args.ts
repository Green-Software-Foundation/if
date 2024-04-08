import * as path from 'path';
import {parse} from 'ts-command-line-args';

import {checkIfFileIsYaml} from './yaml';
import {ERRORS} from './errors';
import {logger} from './logger';

import {CONFIG, STRINGS} from '../config';

import {ManifestProcessArgs} from '../types/process-args';

const {CliInputError} = ERRORS;

const {impact} = CONFIG;
const {ARGS, HELP, NO_OUTPUT} = impact;

const {FILE_IS_NOT_YAML, MANIFEST_IS_MISSING} = STRINGS;

/**
 * Validates process arguments
 */
const validateAndParseProcessArgs = () => {
  try {
    return parse<ManifestProcessArgs>(ARGS);
  } catch (error) {
    if (error instanceof Error) {
      throw new CliInputError(error.message);
    }

    throw error;
  }
};

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
 * 1. Parses process arguments like `manifest`, `output`, `override-params` and `help`.
 * 2. Checks if `help` param is provided, then logs help message and exits.
 * 3. If output params are missing, warns user about it.
 * 3. Otherwise checks if `manifest` param is there, then processes with checking if it's a yaml file.
 *    If it is, then returns object containing full path.
 * 4. If params are missing or invalid, then rejects with `CliInputError`.
 */
export const parseArgs = () => {
  const {
    manifest,
    output,
    'override-params': overrideParams,
    help,
    stdout,
  } = validateAndParseProcessArgs();

  if (help) {
    console.info(HELP);
    return;
  }

  if (!output && !stdout) {
    logger.warn(NO_OUTPUT);
  }

  if (manifest) {
    if (checkIfFileIsYaml(manifest)) {
      return {
        inputPath: prependFullFilePath(manifest),
        outputOptions: {
          ...(output && {outputPath: prependFullFilePath(output)}),
          ...(stdout && {stdout}),
        },
        ...(overrideParams && {paramPath: overrideParams}),
      };
    }

    throw new CliInputError(FILE_IS_NOT_YAML);
  }

  throw new CliInputError(MANIFEST_IS_MISSING);
};
