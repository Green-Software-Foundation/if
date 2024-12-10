import {parse} from 'ts-command-line-args';
import {ERRORS} from '@grnsft/if-core/utils';

import {isFileExists, isDirectoryExists} from '../../common/util/fs';
import {prependFullFilePath, runHelpCommand} from '../../common/util/helpers';
import {checkIfFileIsYaml} from '../../common/util/yaml';

import {STRINGS as COMMON_STRINGS} from '../../common/config';

import {IFMergeArgs} from '../types/process-args';

import {CONFIG, STRINGS} from '../config';

const {ParseCliParamsError, InvalidDirectoryError, CliSourceFileError} = ERRORS;
const {ARGS, HELP} = CONFIG;
const {MANIFEST_IS_NOT_YAML} = STRINGS;
const {MANIFEST_NOT_FOUND, DIRECTORY_NOT_FOUND} = COMMON_STRINGS;

/**
 * Parses `if-merge` process arguments.
 */
const validateAndParseIfMergeArgs = () => {
  try {
    return parse<IFMergeArgs>(ARGS, HELP);
  } catch (error) {
    if (error instanceof Error) {
      runHelpCommand('if-merge');
    }

    throw error;
  }
};

/**
 * Checks if the `manifests` command is provided and they are valid manifests files or a folder.
 */
export const parseIfMergeArgs = async () => {
  const {manifests, output, name, description} = validateAndParseIfMergeArgs();

  const manifestsWithFullPath = [];

  if (manifests.length === 1) {
    const isDirectory = await isDirectoryExists(manifests[0]);
    if (!isDirectory) {
      throw new InvalidDirectoryError(DIRECTORY_NOT_FOUND);
    }

    return {manifests, output, name, description};
  }

  for await (const manifest of manifests) {
    const response = prependFullFilePath(manifest);
    const isManifestFileExists = await isFileExists(response);
    const isYamlFile = checkIfFileIsYaml(response);

    if (!isManifestFileExists) {
      throw new ParseCliParamsError(`${manifest} ${MANIFEST_NOT_FOUND}`);
    }

    if (!isYamlFile) {
      throw new CliSourceFileError(MANIFEST_IS_NOT_YAML(manifest));
    }

    if (checkIfFileIsYaml(manifest)) {
      manifestsWithFullPath.push(response);
    }
  }

  return {manifests: manifestsWithFullPath, output, name, description};
};
