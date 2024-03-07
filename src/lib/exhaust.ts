import {ExhaustPluginInterface} from '../types/interface';
import {Context} from '../types/manifest';

/**
 * Output manager - Exhaust.
 * Grabs output plugins from context, executes every.
 */
export const exhaust = (
  tree: any,
  exhaustPlugins: ExhaustPluginInterface[],
  context: Context,
  outputPath?: string
) => {
  exhaustPlugins.forEach(plugin => plugin.execute(tree, context, outputPath));
};
