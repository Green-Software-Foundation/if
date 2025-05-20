import {ERRORS} from '@grnsft/if-core/utils';

import {saveYamlFileAs} from '../../common/util/yaml';

import {STRINGS} from '../config';

import {Context} from '../../common/types/manifest';

const {ExhaustOutputArgError} = ERRORS;
const {OUTPUT_REQUIRED, EXPORTING_TO_YAML_FILE} = STRINGS;

export const ExportYaml = () => {
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
    const pathWithoutExtension =
      outputPath.split('.').length > 1
        ? outputPath.split('.').slice(0, -1).join('.')
        : outputPath;

    console.debug(EXPORTING_TO_YAML_FILE(pathWithoutExtension));

    await saveYamlFileAs(outputFile, `${pathWithoutExtension}.yaml`);
  };

  return {execute};
};
