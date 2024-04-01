import {saveYamlFileAs} from '../util/yaml';

import {ERRORS} from '../util/errors';

import {Context} from '../types/manifest';

const {CliInputError} = ERRORS;

export const ExportYaml = () => {
  /** Takes string before hashtag. */
  const stripHashtag = (path: string) => path.split('#')[0];

  /**
   * Saves output file in YAML format.
   */
  const executeExhaust = async (
    tree: any,
    context: Context,
    outputPath: string
  ) => {
    if (!outputPath) {
      throw new CliInputError('Output path is required.');
    }

    const outputFile = {
      ...context,
      tree,
    };
    const path = stripHashtag(outputPath);

    await saveYamlFileAs(outputFile, `${path}.yaml`);
  };

  return {executeExhaust};
};
