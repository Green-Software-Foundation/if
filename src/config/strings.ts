export const STRINGS = {
  FILE_IS_NOT_YAML: 'Provided impl file is not in yaml format.',
  IMPL_IS_MISSING: 'Impl file is missing.',
  MISSING_CLASSNAME: 'Initalization param `model` is missing.',
  MISSING_PATH: 'Initalization param `path` is missing.',
  MODEL_DOESNT_EXIST: 'Provided model class does not belong to any model.',
  NOT_OUTPUT_MODEL_EXTENSION: 'Provided model does not extend ModelInterface.',
  STRUCTURE_MALFORMED: (childName: string) =>
    `Graph is malformed: graph.children.${childName} is not valid.`,
  NOT_INITIALIZED_MODEL: (modelName: string) =>
    `Model ${modelName} is not initalized yet.`,
};
