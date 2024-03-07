import {saveYamlFileAs} from '../util/yaml';

import {ERRORS} from '../util/errors';

import {PluginInterface} from '../types/interface';
import {Context} from '../types/manifest';

const {CliInputError} = ERRORS;

export const ExportYaml = (): PluginInterface<'exhaust'> => {
  /**
   * Saves output file in YAML format.
   */
  const execute = async (tree: any, context: Context, outputPath?: string) => {
    if (!outputPath) {
      throw new CliInputError('Output path is required.');
    }

    const outputFile = {
      ...context,
      tree,
    };

    await saveYamlFileAs(outputFile, `${outputPath}.yaml`);
  };

  return {
    metadata: {
      kind: 'exhaust',
    },
    execute,
  };
};
