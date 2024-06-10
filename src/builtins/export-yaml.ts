import {saveYamlFileAs} from '../util/yaml';
import {ERRORS} from '../util/errors';

import {STRINGS} from '../config';

import {Context} from '../types/manifest';

const {ExhaustOutputArgError} = ERRORS;
const {OUTPUT_REQUIRED} = STRINGS;

export const ExportYaml = () => {
  /** Takes string before hashtag. */
  const stripHashtag = (path: string) => path.split('#')[0];

  /**
   * Saves output file in YAML format.
   */
  const execute = async (tree: any, context: Context, outputPath: string) => {
    if (!outputPath) {
      throw new ExhaustOutputArgError(OUTPUT_REQUIRED);
    }

    const outputFile = {
      ...context,
      tree,
    };
    const path = stripHashtag(outputPath);

    await saveYamlFileAs(outputFile, `${path}.yaml`);
  };

  return {execute};
};
