export const STRINGS = {
  WRONG_CLI_ARGUMENT: 'Wrong or missing argument.',
  MISSING_CLASSNAME: 'Model classname is missing.',
  NOT_INPUT_MODEL_EXTENSION:
    'Provided model does not extend IImpactModelInterface.',
  NOT_INITIALIZED_MODEL: (modelName: string) =>
    `Model ${modelName} is not initalized yet.`,
  WRONG_OR_MISSING_MODEL: (modelName: string) =>
    `Missing or wrong model: ${modelName}.`,
  MISSING_PATH: 'Plugin path parameter is missing.',
};
