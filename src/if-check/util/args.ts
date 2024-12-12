import {parse} from 'ts-command-line-args';
import {ERRORS} from '@grnsft/if-core/utils';

import {isDirectoryExists, isFileExists} from '../../common/util/fs';
import {prependFullFilePath, runHelpCommand} from '../../common/util/helpers';
import {checkIfFileIsYaml} from '../../common/util/yaml';

import {CONFIG, STRINGS} from '../config';
import {STRINGS as COMMON_STRINGS} from '../../common/config';

import {IFCheckArgs} from '../types/process-args';

const {
  ParseCliParamsError,
  CliSourceFileError,
  InvalidDirectoryError,
  MissingCliFlagsError,
} = ERRORS;

const {ARGS, HELP} = CONFIG;

const {IF_CHECK_FLAGS_MISSING} = STRINGS;
const {MANIFEST_NOT_FOUND, SOURCE_IS_NOT_YAML, DIRECTORY_NOT_FOUND} =
  COMMON_STRINGS;

/**
 * Parses `if-check` process arguments.
 */
const validateAndParseIfCheckArgs = () => {
  try {
    return parse<IFCheckArgs>(ARGS, HELP);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);

      runHelpCommand('if-check');
    }

    throw error;
  }
};

/**
 * Checks if either `manifest` or `directory` command is provided.
 */
export const parseIfCheckArgs = async () => {
  const {manifest, directory} = validateAndParseIfCheckArgs();

  if (manifest) {
    const response = prependFullFilePath(manifest);
    const isManifestFileExists = await isFileExists(response);

    if (!isManifestFileExists) {
      throw new ParseCliParamsError(MANIFEST_NOT_FOUND);
    }

    if (checkIfFileIsYaml(manifest)) {
      return {manifest};
    }

    throw new CliSourceFileError(SOURCE_IS_NOT_YAML);
  } else if (directory) {
    const isDirExists = await isDirectoryExists(directory);

    if (!isDirExists) {
      throw new InvalidDirectoryError(DIRECTORY_NOT_FOUND);
    }

    const response = prependFullFilePath(directory);

    return {directory: response};
  }

  throw new MissingCliFlagsError(IF_CHECK_FLAGS_MISSING);
};
