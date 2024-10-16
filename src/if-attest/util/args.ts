import {parse} from 'ts-command-line-args';
import {ERRORS} from '@grnsft/if-core/utils';

import {isFileExists} from '../../common/util/fs';
import {prependFullFilePath} from '../../common/util/helpers';
import {checkIfFileIsYaml} from '../../common/util/yaml';

import {CONFIG, STRINGS} from '../config/config';
import {STRINGS as COMMON_STRINGS} from '../../common/config';

import {IFAttestArgs} from '../types/process-args';

const {ParseCliParamsError, CliSourceFileError} = ERRORS;

const {ARGS, HELP} = CONFIG;
const {MANIFEST_IS_NOT_YAML} = STRINGS;
const MANIFEST_NOT_FOUND = COMMON_STRINGS;

/**
 * Parses `if-merge` process arguments.
 */
const validateAndParseIfAttestArgs = () => {
  try {
    return parse<IFAttestArgs>(ARGS, HELP);
  } catch (error) {
    if (error instanceof Error) {
      throw new ParseCliParamsError(error.message);
    }

    throw error;
  }
};

/**
 * Checks if the `manifests` command is provided and they are valid manifests files or a folder.
 */
export const parseIfAttestArgs = async () => {
  const {manifest, blockchain} = validateAndParseIfAttestArgs();

  const response = prependFullFilePath(manifest);
  const isManifestFileExists = await isFileExists(response);
  const isYamlFile = checkIfFileIsYaml(response);

  if (!isManifestFileExists) {
    throw new ParseCliParamsError(`${manifest} ${MANIFEST_NOT_FOUND}`);
  }

  if (!isYamlFile) {
    throw new CliSourceFileError(MANIFEST_IS_NOT_YAML(manifest));
  }

  return {manifest, blockchain};
};
