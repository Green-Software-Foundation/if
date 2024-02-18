const initialize = (pipeline: string[]) => {};

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
