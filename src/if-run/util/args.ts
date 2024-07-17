import {parse} from 'ts-command-line-args';
import {ERRORS} from '@grnsft/if-core/utils';

import {checkIfFileIsYaml} from '../../common/util/yaml';
import {prependFullFilePath} from '../../common/util/helpers';

import {logger} from '../../common/util/logger';

import {CONFIG, STRINGS} from '../config';
import {STRINGS as COMMON_STRINGS} from '../../common/config';

import {IfRunArgs, ProcessArgsOutputs} from '../types/process-args';

const {ParseCliParamsError, CliSourceFileError} = ERRORS;

const {ARGS, HELP} = CONFIG;
const {NO_OUTPUT} = STRINGS;
const {SOURCE_IS_NOT_YAML, MANIFEST_IS_MISSING} = COMMON_STRINGS;

/**
 * Validates `if-run` process arguments.
 */
const validateAndParseProcessArgs = () => {
  try {
    return parse<IfRunArgs>(ARGS, HELP);
  } catch (error) {
    if (error instanceof Error) {
      throw new ParseCliParamsError(error.message);
    }

    throw error;
  }
};

/**
 * 1. Parses process arguments for `if-run`.
 * 2. If output params are missing, warns user about it.
 * 3. Otherwise checks if `manifest` param is there, then processes with checking if it's a yaml file.
 *    If it is, then returns object containing full path.
 * 4. If params are missing or invalid, then rejects with `ParseCliParamsError`.
 */
export const parseIfRunProcessArgs = (): ProcessArgsOutputs => {
  const {
    manifest,
    output,
    'no-output': noOutput,
    debug,
    observe,
    regroup,
    compute,
  } = validateAndParseProcessArgs();

  if (!output && noOutput) {
    logger.warn(NO_OUTPUT);
  }

  if (manifest) {
    if (checkIfFileIsYaml(manifest)) {
      return {
        inputPath: prependFullFilePath(manifest),
        outputOptions: {
          ...(output && {outputPath: prependFullFilePath(output)}),
          ...(noOutput && {noOutput}),
        },
        debug,
        observe,
        regroup,
        compute,
      };
    }

    throw new CliSourceFileError(SOURCE_IS_NOT_YAML);
  }

  throw new CliSourceFileError(MANIFEST_IS_MISSING);
};
