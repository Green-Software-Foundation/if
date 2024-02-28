import {ExportCsv} from '../models/export-csv';
import {ExhaustPluginInterface} from '../types/exhaust-plugin-interface';

/**
 * create exhaust plugins based on the provided config
 */
const createExhaustPlugins = (exhaustPluginConfigs: any) => {
  return Object.keys(exhaustPluginConfigs).map((key: string) =>
    createExhaustPlugin(key, exhaustPluginConfigs[key])
  );
};

/**
 * factory method for exhaust plugins
 */
const createExhaustPlugin = (
  pluginTypeName: string,
  pluginConfigItems: {[key: string]: string}
): ExhaustPluginInterface => {
  switch (pluginTypeName) {
    case 'csv':
      return ExportCsv(pluginConfigItems);
    default:
      throw new Error(`unkonwn exhaust plugin type: ${pluginTypeName}`);
  }
};

/**
 * execute exhaust functionality
 */
export const exhaust = (tree: any, outputs: any) => {
  if (outputs) {
    const exhaustPlugins: ExhaustPluginInterface[] =
      createExhaustPlugins(outputs);
    exhaustPlugins.forEach(plugin => {
      plugin.execute(tree);
    });
  }
};
