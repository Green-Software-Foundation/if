import * as YAML from 'js-yaml';

import {ERRORS} from '../util/errors';
import {openYamlFileAsObject} from '../util/yaml';
import {readAndParseJson} from '../util/json';
import {parseManifestFromStdin} from '../util/helpers';

import {PARAMETERS} from '../config';
import {STRINGS} from '../config';

import {Parameters} from '../types/parameters';
import {LoadDiffParams} from '../types/util/args';
import {Manifest} from '../types/manifest';

const {CliInputError} = ERRORS;

const {INVALID_SOURCE} = STRINGS;

/**
 * Parses manifest file as an object. Checks if parameter file is passed via CLI, then loads it too.
 * Returns context, tree and parameters (either the default one, or from CLI).
 */
export const load = async (inputPath: string, paramPath?: string) => {
  const rawManifest = await openYamlFileAsObject<any>(inputPath);
  const parametersFromCli =
    paramPath &&
    (await readAndParseJson<Parameters>(paramPath)); /** @todo validate json */
  const parameters =
    parametersFromCli ||
    PARAMETERS; /** @todo PARAMETERS should be specified in parameterize only */

  return {
    rawManifest,
    parameters,
  };
};

/**
 * Loads files to compare. As a source file checks if data is piped and then decides which one to take.
 */
export const loadIfDiffFiles = async (params: LoadDiffParams) => {
  const {sourcePath, targetPath} = params;
  const pipedSourceManifest = await parseManifestFromStdin();

  if (!sourcePath && !pipedSourceManifest) {
    throw new CliInputError(INVALID_SOURCE);
  }

  const loadFromSource =
    sourcePath && (await openYamlFileAsObject<Manifest>(sourcePath!));
  const loadFromSTDIN =
    pipedSourceManifest && (await YAML.load(pipedSourceManifest!));

  const rawSourceManifest = loadFromSource || loadFromSTDIN;
  const rawTargetManifest = await openYamlFileAsObject<Manifest>(targetPath);

  return {
    rawSourceManifest,
    rawTargetManifest,
  };
};
