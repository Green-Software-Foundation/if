import {saveYamlFileAs} from '../util/yaml';
import {ERRORS} from '../util/errors';

import {Context} from '../types/manifest';

import {STRINGS} from '../config/strings';

const {ExhaustError} = ERRORS;
const {EXPORTING_TO_YAML_FILE} = STRINGS;

export const ExportYaml = () => {
  /** Takes string before hashtag. */
  const stripHashtag = (path: string) => path.split('#')[0];

  /**
   * Saves output file in YAML format.
   */
  const execute = async (tree: any, context: Context, outputPath: string) => {
    if (!outputPath) {
      throw new ExhaustError('Output path is required.');
    }

    const outputFile = {
      ...context,
      tree,
    };
    const path = stripHashtag(outputPath);

    console.debug(EXPORTING_TO_YAML_FILE(path));

    await saveYamlFileAs(outputFile, `${path}.yaml`);
  };

  return {execute};
};
