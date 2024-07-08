import {ERRORS} from '@grnsft/if-core/utils';

import {saveYamlFileAs} from '../util/yaml';

import {STRINGS} from '../config';

import {Context} from '../types/manifest';

const {ExhaustOutputArgError} = ERRORS;
const {OUTPUT_REQUIRED, EXPORTING_TO_YAML_FILE} = STRINGS;

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
    const pathWithoutExtension =
      path.split('.').length > 1
        ? path.split('.').slice(0, -1).join('.')
        : path;

    console.debug(EXPORTING_TO_YAML_FILE(pathWithoutExtension));

    await saveYamlFileAs(outputFile, `${pathWithoutExtension}.yaml`);
  };

  return {execute};
};
