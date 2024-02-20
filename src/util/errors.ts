const CUSTOM_ERRORS = [
  'CliInputError',
  'FileNotFoundError',
  'ManifestValidationError',
  'InputValidationError',
  'InvalidAggregationParams',
  'InvalidGrouping',
  'ModuleInitializationError',
  'PluginCredentialError',
  'PluginInterfaceError',
  'WriteFileError',
] as const;

type CustomErrors = {
  [K in (typeof CUSTOM_ERRORS)[number]]: ErrorConstructor;
};

export const ERRORS = CUSTOM_ERRORS.reduce((acc, className) => {
  acc = {
    ...acc,
    [className]: class extends Error {
      constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
      }
    },
  };

  return acc;
}, {} as CustomErrors);
