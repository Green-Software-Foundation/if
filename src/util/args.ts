import * as path from 'path';
import {parse} from 'ts-command-line-args';

import {checkIfFileIsYaml} from './yaml';
import {ERRORS} from './errors';
import {logger} from './logger';

import {CONFIG, STRINGS} from '../config';

import {IFDiffArgs, IEArgs, ProcessArgsOutputs} from '../types/process-args';
import {LoadDiffParams} from '../types/util/args';

const {CliInputError} = ERRORS;

const {IE, IF_DIFF} = CONFIG;

const {FILE_IS_NOT_YAML, MANIFEST_IS_MISSING, NO_OUTPUT} = STRINGS;

/**
 * Validates `ie` process arguments.
 */
const validateAndParseProcessArgs = () => {
  try {
    return parse<IEArgs>(IE.ARGS, IE.HELP);
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
export const parseIEProcessArgs = (): ProcessArgsOutputs => {
  const {
    manifest,
    output,
    'override-params': overrideParams,
    stdout,
  } = validateAndParseProcessArgs();

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

/** -- IF Diff -- */

/**
 * Parses `if-diff` process arguments.
 */
const validateAndParseIfDiffArgs = () => {
  try {
    return parse<IFDiffArgs>(IF_DIFF.ARGS, IF_DIFF.HELP);
  } catch (error) {
    if (error instanceof Error) {
      throw new CliInputError(error.message);
    }

    throw error;
  }
};

/**
 * Checks for `source` and `target` flags to be present.
 */
export const parseIfDiffArgs = () => {
  const {source, target} = validateAndParseIfDiffArgs();

  if (target) {
    if (checkIfFileIsYaml(target)) {
      const response: LoadDiffParams = {
        targetPath: prependFullFilePath(target),
      };

      if (source && checkIfFileIsYaml(source)) {
        response.sourcePath = prependFullFilePath(source);
      }

      return response;
    }

    throw new CliInputError(FILE_IS_NOT_YAML); // change to one of the source or target parts are not a yaml
  }

  throw new CliInputError(MANIFEST_IS_MISSING); // change to one of the source or target are missing
};
