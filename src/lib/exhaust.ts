import {ExhaustExportCsv} from '../models/exhaust-export-csv';
import {ExhaustPluginInterface} from '../models/exhaust-plugin';

const createExhaustPlugin = (
  pluginTypeName: string
): ExhaustPluginInterface => {
  switch (pluginTypeName) {
    case 'csv':
      return ExhaustExportCsv();
    default:
      throw new Error(`unkonwn exhaust plugin type: ${pluginTypeName}`);
  }
};

const initialize = (pipeline: string[]): ExhaustPluginInterface[] => {
  const exhaustPlugins: ExhaustPluginInterface[] = pipeline.map(
    exhaustPluginName => createExhaustPlugin(exhaustPluginName)
  );
  return exhaustPlugins;
};

export const exhaust = (context: any, tree: any) => {
  if (context && context.exhaust) {
    const pipeline = context.exhaust.pipeline;
    const basePath = context.exhaust.basePath;
    const importedModels: ExhaustPluginInterface[] = initialize(pipeline);
    importedModels.forEach(plugin => {
      plugin.execute(tree, basePath);
    });
  }
};
