import {ExportLog} from '../models/export-log';

import {ExhaustPluginInterface} from '../types/interface';
import {Context} from '../types/manifest';

/**
 * Output manager - Exhaust.
 * Grabs output plugins from context, executes every.
 */
export const exhaust = (
  tree: any,
  exhaustPluginsStorage: ExhaustPluginInterface[],
  context: Context,
  outputPath?: string
) => {
  const exhaustPlugins = context.initialize.exhaustPlugins;

  if (!exhaustPlugins) {
    ExportLog().execute(tree, context);
    return;
  }
  exhaustPluginsStorage.forEach(plugin =>
    plugin.execute(tree, context, outputPath)
  );
};
