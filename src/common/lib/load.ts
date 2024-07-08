import {openYamlFileAsObject} from '../util/yaml';
import {readAndParseJson} from '../../if-run/util/json';

import {PARAMETERS} from '../../if-run/config';
import {STRINGS} from '../../if-run/config';

import {Parameters} from '../../if-run/types/parameters';

const {LOADING_MANIFEST} = STRINGS;

/**
 * Parses manifest file as an object. Checks if parameter file is passed via CLI, then loads it too.
 * Returns context, tree and parameters (either the default one, or from CLI).
 */
export const load = async (inputPath: string, paramPath?: string) => {
  console.debug(LOADING_MANIFEST);

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
