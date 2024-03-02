import {validateManifest} from '../util/validations';
import {openYamlFileAsObject} from '../util/yaml';
import {readAndParseJson} from '../util/json';

import {PARAMETERS} from '../config';

import {Manifest} from '../types/manifest';
import {ContextTreeParams} from '../types/load';
import {Parameters} from '../types/parameters';

/**
 * Parses manifest file as an object. Checks if parameter file is passed via CLI, then loads it too.
 * Returns context, tree and parameters (either the default one, or from CLI).
 */
export const load = async (
  inputPath: string,
  paramPath?: string
): Promise<ContextTreeParams> => {
  const safeManifest = await openYamlFileAsObject<Manifest>(inputPath);
  const {name, description, tags, params, aggregation, initialize, tree} =
    validateManifest(safeManifest);
  const parametersFromCli =
    paramPath && (await readAndParseJson<Parameters>(paramPath)); // todo: validate json
  const parameters = parametersFromCli || PARAMETERS;

  return {
    tree,
    context: {name, description, tags, params, aggregation, initialize},
    parameters,
  };
};
