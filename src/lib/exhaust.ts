import {ExhaustExportCsv} from '../models/exhaust-export-csv';
import {ExhaustPluginInterface} from '../models/exhaust-plugin-interface';

const createExhaustPlugins = (exhaustPluginConfigs: any) => {
  return Object.keys(exhaustPluginConfigs).map((key: string) =>
    createExhaustPlugin(key, exhaustPluginConfigs[key])
  );
};

const createExhaustPlugin = (
  pluginTypeName: string,
  pluginConfigItems: any
): ExhaustPluginInterface => {
  switch (pluginTypeName) {
    case 'csv':
      return ExhaustExportCsv(pluginConfigItems);
    default:
      throw new Error(`unkonwn exhaust plugin type: ${pluginTypeName}`);
  }
};

export const exhaust = (context: any, tree: any) => {
  if (context && context.initialize.outputs) {
    const exhaustPlugins: ExhaustPluginInterface[] = createExhaustPlugins(
      context.initialize.outputs
    );
    exhaustPlugins.forEach(plugin => {
      plugin.execute(tree);
    });
  }
};
