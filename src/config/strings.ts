export const STRINGS = {
  FILE_IS_NOT_YAML: 'Provided impl file is not in yaml format.',
  IMPL_IS_MISSING: 'Impl file is missing.',
  MISSING_CLASSNAME: 'Initalization param `model` is missing.',
  MISSING_PATH: 'Initalization param `path` is missing.',
  NOT_OUTPUT_MODEL_EXTENSION: 'Provided model does not extend ModelInterface.',
  NOT_INITIALIZED_MODEL: (modelName: string) =>
    `Model ${modelName} is not initalized yet.`,
  WRONG_OR_MISSING_MODEL: (modelName: string) =>
    `You are trying to configure a built-in model that is not recognized: ${modelName}.`,
};
