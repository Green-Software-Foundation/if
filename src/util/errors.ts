const CUSTOM_ERRORS = [
  'CliInputError',
  'ManifestValidationError',
  'InputValidationError',
  'InvalidGroupingError',
  'WriteFileError',
  /** More specific errors */
  'ParseCliParamsError',
  'CliSourceFileError',
  'CliTargetFileError',
  'InvalidAggregationMethodError',
  'MissingAggregationParamError',
  'MissingPluginMethodError',
  'MissingPluginPathError',
  'PluginInitializationError',
  'InvalidExhaustPluginError',
  /** Plugins */
  'GlobalConfigError',
  'MissingInputDataError',
  'ProcessExecutionError',
  'RegexMismatchError',
  'FetchingFileError',
  'ReadFileError',
  'MissingCSVColumnError',
  'QueryDataNotFoundError',
  'InvalidDateInInputError',
  'InvalidPaddingError',
  'InvalidInputError',
  'ExhaustOutputArgError',
  'CSVParseError',
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
