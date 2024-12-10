import {parse} from 'ts-command-line-args';
import {ERRORS} from '@grnsft/if-core/utils';

import {checkIfFileIsYaml} from '../../common/util/yaml';
import {prependFullFilePath, runHelpCommand} from '../../common/util/helpers';

import {CONFIG} from '../config';
import {STRINGS as COMMON_STRINGS} from '../../common/config';

import {IFCsvArgs} from '../types/process-args';
import {isFileExists} from '../../common/util/fs';

const {ParseCliParamsError, CliSourceFileError} = ERRORS;

const {ARGS, HELP} = CONFIG;
const {SOURCE_IS_NOT_YAML, MANIFEST_NOT_FOUND} = COMMON_STRINGS;

/**
 * Parses `if-csv` process arguments.
 */
const validateAndParseIfCsvArgs = () => {
  try {
    return parse<IFCsvArgs>(ARGS, HELP);
  } catch (error) {
    if (error instanceof Error) {
      runHelpCommand('if-csv');
    }

    throw error;
  }
};

/**
 * Checks for `manifest` and `params` flags to be present.
 */
export const parseIfCsvArgs = async () => {
  const {manifest, output, params} = validateAndParseIfCsvArgs();

  if (manifest) {
    const response = prependFullFilePath(manifest);
    const isManifestFileExists = await isFileExists(response);

    if (!isManifestFileExists) {
      throw new ParseCliParamsError(MANIFEST_NOT_FOUND);
    }

    if (checkIfFileIsYaml(manifest)) {
      return {manifest, output, params};
    }

    throw new CliSourceFileError(SOURCE_IS_NOT_YAML);
  }

  return {output, params};
};
