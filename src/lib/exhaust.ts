import {ExhaustExportCsv} from '../models/exhaust-export-csv';

const createExhaustPlugin = (pluginTypeName: string) => {
  switch (pluginTypeName) {
    case 'csv':
      return ExhaustExportCsv;
    default:
      throw new Error(`unkonwn exhaust plugin type: ${pluginTypeName}`);
  }
};

const initialize = (pipeline: string[]) => {
  const exhaustPlugins: any[] = pipeline.map(exhaustPluginName =>
    createExhaustPlugin(exhaustPluginName)
  );
  return exhaustPlugins;
};

export const exhaust = (context: any, tree: any) => {
  const pipe =
    (...fns: any[]) =>
    (x: any) =>
      fns.reduce((v, f) => f(v), x);

  // TODO PB - validate exhaust options
  const {pipeline, basePath} = context.exhaust; // = exhaust options

  // import models from pipelint
  const importedModels = initialize(pipeline);

  return pipe(importedModels)({context, tree, basePath});
};
