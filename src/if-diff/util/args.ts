import {parse} from 'ts-command-line-args';
import {ERRORS} from '@grnsft/if-core/utils';

import {checkIfFileIsYaml} from '../../common/util/yaml';
import {prependFullFilePath, runHelpCommand} from '../../common/util/helpers';

import {CONFIG, STRINGS} from '../config';
import {STRINGS as COMMON_STRINGS} from '../../common/config';

import {IFDiffArgs} from '../types/process-args';
import {LoadDiffParams} from '../types/args';

const {ParseCliParamsError, CliTargetFileError, CliSourceFileError} = ERRORS;

const {ARGS, HELP} = CONFIG;
const {INVALID_TARGET} = STRINGS;
const {SOURCE_IS_NOT_YAML, TARGET_IS_NOT_YAML} = COMMON_STRINGS;

/**
 * Parses `if-diff` process arguments.
 */
const validateAndParseIfDiffArgs = () => {
  try {
    return parse<IFDiffArgs>(ARGS, HELP);
  } catch (error) {
    if (error instanceof Error) {
      runHelpCommand('if-diff');
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
