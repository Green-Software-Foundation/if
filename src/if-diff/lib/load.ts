import * as YAML from 'js-yaml';

import {ERRORS} from '@grnsft/if-core/utils';

import {openYamlFileAsObject} from '../../common/util/yaml';

import {STRINGS} from '../config';

import {LoadDiffParams} from '../types/args';
import {Manifest} from '../../common/types/manifest';

const {CliSourceFileError} = ERRORS;

const {INVALID_SOURCE} = STRINGS;

/**
 * Loads files to compare. As a source file checks if data is piped and then decides which one to take.
 */
export const loadIfDiffFiles = async (params: LoadDiffParams) => {
  const {sourcePath, targetPath, pipedSourceManifest} = params;

  if (!sourcePath && !pipedSourceManifest) {
    throw new CliSourceFileError(INVALID_SOURCE);
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
