import * as path from 'path';

import {parse} from 'ts-command-line-args';
import {ERRORS} from '@grnsft/if-core/utils';

import {checkIfFileIsYaml} from './yaml';
import {logger} from './logger';

import {CONFIG, STRINGS} from '../config';

import {IFDiffArgs, IEArgs, ProcessArgsOutputs} from '../types/process-args';
import {LoadDiffParams} from '../types/util/args';

const {ParseCliParamsError, CliTargetFileError, CliSourceFileError} = ERRORS;

const {IE, IF_DIFF} = CONFIG;

const {
  MANIFEST_IS_MISSING,
  NO_OUTPUT,
  SOURCE_IS_NOT_YAML,
  TARGET_IS_NOT_YAML,
  INVALID_TARGET,
} = STRINGS;

/**
 * Validates `ie` process arguments.
 */
const validateAndParseProcessArgs = () => {
  try {
    return parse<IEArgs>(IE.ARGS, IE.HELP);
  } catch (error) {
    if (error instanceof Error) {
      throw new ParseCliParamsError(error.message);
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
 * 1. Parses process arguments like `manifest`, `output`, `override-params`, `help` and `debug`.
 * 2. Checks if `help` param is provided, then logs help message and exits.
 * 3. If output params are missing, warns user about it.
 * 3. Otherwise checks if `manifest` param is there, then processes with checking if it's a yaml file.
 *    If it is, then returns object containing full path.
 * 4. If params are missing or invalid, then rejects with `ParseCliParamsError`.
 */
export const parseIEProcessArgs = (): ProcessArgsOutputs => {
  const {
    manifest,
    output,
    'override-params': overrideParams,
    stdout,
    debug,
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
        debug,
      };
    }

    throw new CliSourceFileError(SOURCE_IS_NOT_YAML);
  }

  throw new CliSourceFileError(MANIFEST_IS_MISSING);
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
      throw new ParseCliParamsError(error.message);
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
    if (source && !checkIfFileIsYaml(source)) {
      throw new CliSourceFileError(SOURCE_IS_NOT_YAML);
    }

    if (checkIfFileIsYaml(target)) {
      const response: LoadDiffParams = {
        targetPath: prependFullFilePath(target),
      };

      if (source && checkIfFileIsYaml(source)) {
        response.sourcePath = prependFullFilePath(source);
      }

      return response;
    }

    throw new CliTargetFileError(TARGET_IS_NOT_YAML);
  }

  throw new ParseCliParamsError(INVALID_TARGET);
};
