import {parse} from 'ts-command-line-args';

import {ERRORS} from '@grnsft/if-core/utils';

import {isFileExists} from '../../common/util/fs';
import {prependFullFilePath} from '../../common/util/helpers';
import {checkIfFileIsYaml} from '../../common/util/yaml';

import {CONFIG} from '../config';
import {STRINGS as COMMON_STRINGS} from '../../common/config';

import {IFEnvArgs} from '../types/process-args';

const {ParseCliParamsError, CliSourceFileError} = ERRORS;
const {ARGS, HELP} = CONFIG;
const {MANIFEST_NOT_FOUND, SOURCE_IS_NOT_YAML} = COMMON_STRINGS;

/**
 * Parses `if-env` process arguments.
 */
const validateAndParseIfEnvArgs = () => {
  try {
    return parse<IFEnvArgs>(ARGS, HELP);
  } catch (error) {
    if (error instanceof Error) {
      throw new ParseCliParamsError(error.message);
    }

    throw error;
  }
};

/**
 * Checks if the `manifest` command is provided and it is valid manifest file.
 */
export const parseIfEnvArgs = async () => {
  const {manifest, install, cwd} = validateAndParseIfEnvArgs();

  if (manifest) {
    const response = prependFullFilePath(manifest);
    const isManifestFileExists = await isFileExists(response);

    if (!isManifestFileExists) {
      throw new ParseCliParamsError(MANIFEST_NOT_FOUND);
    }

    if (checkIfFileIsYaml(manifest)) {
      return {manifest: response, install, cwd};
    }

    throw new CliSourceFileError(SOURCE_IS_NOT_YAML);
  }

  return {install, cwd};
};
