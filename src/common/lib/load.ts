import {openYamlFileAsObject} from '../util/yaml';

import {STRINGS} from '../../if-run/config';

const {LOADING_MANIFEST} = STRINGS;

/**
 * Parses manifest file as an object.
 */
export const load = async (inputPath: string) => {
  console.debug(LOADING_MANIFEST);

  const rawManifest = await openYamlFileAsObject<any>(inputPath);

  return {
    rawManifest,
  };
};
