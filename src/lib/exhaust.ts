/**
 * @todo This is temporary solution, will be refactored to support dynamic plugins.
 */
import {ExportCSV} from '../builtins/export-csv';
import {ExportCSVRaw} from '../builtins/export-csv-raw';
import {ExportLog} from '../builtins/export-log';
import {ExportYaml} from '../builtins/export-yaml';

import {ERRORS} from '../util/errors';

import {STRINGS} from '../config';

import {ExhaustPluginInterface} from '../types/exhaust-plugin-interface';
import {Context} from '../types/manifest';

const {ModuleInitializationError} = ERRORS;
const {INVALID_EXHAUST_PLUGIN} = STRINGS;

/**
 * Initialize exhaust plugins based on the provided config
 */
const initializeExhaustPlugins = (plugins: string[]) =>
  plugins.map(initializeExhaustPlugin);

/**
 * Factory method for exhaust plugins.
 */
const initializeExhaustPlugin = (name: string): ExhaustPluginInterface => {
  switch (name) {
    case 'yaml':
      return ExportYaml();
    case 'csv':
      return ExportCSV();
    case 'csv-raw':
      return ExportCSVRaw();
    case 'log':
      return ExportLog();
    default:
      throw new ModuleInitializationError(INVALID_EXHAUST_PLUGIN(name));
  }
};

/**
 * Output manager - Exhaust.
 * Grabs output plugins from context, executes every.
 */
export const exhaust = async (
  tree: any,
  context: Context,
  outputPath?: string
) => {
  const outputPlugins = context.initialize.outputs;

  if (!outputPlugins) {
    ExportLog().execute(tree, context);

    return;
  }

  const exhaustPlugins = initializeExhaustPlugins(outputPlugins);

  for await (const plugin of exhaustPlugins) {
    await plugin.execute(tree, context, outputPath);
  }
};
