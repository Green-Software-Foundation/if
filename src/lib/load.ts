import {validateManifest} from '../util/validations';
import {openYamlFileAsObject} from '../util/yaml';

import {Manifest} from '../types/manifest';
import {ContextTree} from '../types/load';

/**
 * Parses YAML file as a object, then contructs tree, context interface.
 */
export const load = async (inputPath: string): Promise<ContextTree> => {
  const safeManifest = await openYamlFileAsObject<Manifest>(inputPath);
  const {initialize, aggregation, params, tags, description, name, tree} =
    validateManifest(safeManifest);

  return {
    tree,
    context: {
      initialize,
      aggregation,
      params,
      tags,
      description,
      name,
    },
  };
};
