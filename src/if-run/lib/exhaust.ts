/**
 * @todo This is temporary solution, will be refactored to support dynamic plugins.
 */
import {ExportLog} from '../builtins/export-log';
import {ExportYaml} from '../builtins/export-yaml';

import {STRINGS} from '../config';

import {Options} from '../types/process-args';
import {Context} from '../../common/types/manifest';

const {PREPARING_OUTPUT_DATA} = STRINGS;

/**
 * Output manager - Exhaust.
 * Grabs output plugins from context, executes every.
 */
export const exhaust = async (
  tree: any,
  context: Context,
  outputOptions: Options
) => {
  console.debug(PREPARING_OUTPUT_DATA(), '\n');

  if (!outputOptions.noOutput && !outputOptions.outputPath) {
    ExportLog().execute(tree, context);
  }

  if (!outputOptions.outputPath) {
    return;
  }

  const exportYaml = ExportYaml();

  await exportYaml.execute(tree, context, outputOptions.outputPath);
};
