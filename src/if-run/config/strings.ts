export const STRINGS = {
  MISSING_METHOD: "Initalization param 'method' is missing.",
  MISSING_PATH: "Initalization param 'path' is missing.",
  UNSUPPORTED_PLUGIN:
    "Plugin interface doesn't implement 'execute' or 'metadata' methods.",
  NOT_NATIVE_PLUGIN: (path: string) =>
    `
  You are using plugin ${path} which is not part of the Impact Framework standard library. You should do your own research to ensure the plugins are up to date and accurate. They may not be actively maintained.`,
  INVALID_MODULE_PATH: (path: string, error?: any) =>
    `Provided module \`${path}\` is invalid or not found. ${error ?? ''}
`,
  INVALID_TIME_NORMALIZATION: 'Start time or end time is missing.',
  UNEXPECTED_TIME_CONFIG:
    'Unexpected node-level config provided for time-sync plugin.',
  INVALID_TIME_INTERVAL: 'Interval is missing.',
  AVOIDING_PADDING: (description: string) =>
    `Avoiding padding at ${description}`,
  AVOIDING_PADDING_BY_EDGES: (start: boolean, end: boolean) =>
    `Avoiding padding at ${
      start && end ? 'start and end' : start ? 'start' : 'end'
    }`,
  INVALID_AGGREGATION_METHOD: (metric: string) =>
    `Aggregation is not possible for given ${metric} since method is 'none'.`,
  METRIC_MISSING: (metric: string, index: number) =>
    `Aggregation metric ${metric} is not found in inputs[${index}].`,
  INVALID_GROUP_KEY: (key: string) => `Invalid group ${key}.`,
  REGROUP_ERROR: 'not an array or should contain at least one key',
  INVALID_EXHAUST_PLUGIN: (pluginName: string) =>
    `Invalid exhaust plugin: ${pluginName}.`,
  UNKNOWN_PARAM: (name: string) =>
    `Unknown parameter: ${name}. Omitting from the output.`,
  NOT_INITALIZED_PLUGIN: (name: string) =>
    `Not initalized plugin: ${name}. Check if ${name} is in 'manifest.initalize.plugins'.`,
  NO_OUTPUT: `
You have not added an output command: 
--output <savepath>: will save your output data to the given filepath (do not provide file extension)
Note that for the '--output' option you also need to define the output type in your manifest file. See https://if.greensoftware.foundation/major-concepts/manifest-file#initialize`,
  UNSUPPORTED_ERROR: (errorName: string) =>
    `UnsupportedErrorClass: plugin threw error class: ${errorName} that is not recognized by Impact Framework`,
  /** Debugging logs */
  STARTING_IF: 'Starting IF',
  EXITING_IF: 'Exiting IF',
  LOADING_MANIFEST: 'Loading manifest',
  VALIDATING_MANIFEST: 'Validating manifest',
  CAPTURING_RUNTIME_ENVIRONMENT_DATA: 'Capturing runtime environment data',
  CHECKING_AGGREGATION_METHOD: (unitName: string) =>
    `Checking aggregation method for ${unitName}`,
  INITIALIZING_PLUGINS: 'Initializing plugins',
  INITIALIZING_PLUGIN: (pluginName: string) =>
    `Initializing \`${pluginName}\` plugin`,
  LOADING_PLUGIN_FROM_PATH: (pluginName: string, path: string) =>
    `Loading ${pluginName} from ${path}`,
  COMPUTING_PIPELINE_FOR_NODE: (nodeName: string) =>
    `Running compute pipeline: \`${nodeName}\` plugin`,
  REGROUPING: 'Regrouping',
  OBSERVING: (nodeName: string) =>
    `Running observe pipeline: \`${nodeName}\` plugin`,
  MERGING_DEFAULTS_WITH_INPUT_DATA: 'Merging defaults with input data',
  AGGREGATING_OUTPUTS: 'Aggregating outputs',
  AGGREGATING_NODE: (nodeName: string) => `Aggregating node ${nodeName}`,
  PREPARING_OUTPUT_DATA: 'Preparing output data',
  EXPORTING_TO_YAML_FILE: (savepath: string) =>
    `Exporting to yaml file: ${savepath}`,
  EMPTY_PIPELINE: `You're using an old style manifest. Please update for phased execution. More information can be found here: 
https://if.greensoftware.foundation/major-concepts/manifest-file`,
  /** Exhaust messages */
  OUTPUT_REQUIRED:
    'Output path is required, please make sure output is configured properly.',
  /** Plugins messages */
  INVALID_NAME:
    '`name` global config parameter is empty or contains all spaces',
  START_LOWER_END: '`start-time` should be lower than `end-time`',
  TIMESTAMP_REQUIRED: (index: number) => `required in input[${index}]`,
  INVALID_DATETIME: (index: number) => `invalid datetime in input[${index}]`,
  X_Y_EQUAL: 'The length of `x` and `y` should be equal',
  ARRAY_LENGTH_NON_EMPTY:
    'the length of the input arrays must be greater than 1',
  WITHIN_THE_RANGE:
    'The target x value must be within the range of the given x values',
  MISSING_CSV_COLUMN: (columnName: string) =>
    `There is no column with the name: ${columnName}.`,
  NO_QUERY_DATA:
    'One or more of the given query parameters are not found in the target CSV file column headers.',
  INVALID_DATE_TYPE: (date: any) =>
    `Unexpected date datatype: ${typeof date}: ${date}`,
  INVALID_OBSERVATION_OVERLAP:
    'Observation timestamps overlap, please check inputs.',
  SCI_MISSING_FN_UNIT: (functionalUnit: string) =>
    `'carbon' and ${functionalUnit} should be present in your input data.`,
  MISSING_FUNCTIONAL_UNIT_CONFIG:
    '`functional-unit` should be provided in your global config',
  MISSING_FUNCTIONAL_UNIT_INPUT:
    '`functional-unit` value is missing from input data or it is not a positive integer',
  REGEX_MISMATCH: (input: any, match: string) =>
    `\`${input}\` does not match the ${match} regex expression`,
  SCI_EMBODIED_ERROR: (unit: string) =>
    `invalid number. please provide it as \`${unit}\` to input`,
  MISSING_MIN_MAX: 'Config is missing min or max value',
  INVALID_MIN_MAX: (name: string) =>
    `Min value should not be greater than or equal to max value of ${name}`,
  FILE_FETCH_FAILED: (
    filepath: string,
    message: string
  ) => `Failed fetching the file: ${filepath}.
${message}`,
  FILE_READ_FAILED: (
    filepath: string,
    error: string
  ) => `Failed reading the file: ${filepath}. 
${error}`,
  ZERO_DIVISION: (moduleName: string, index: number) =>
    `-- SKIPPING -- DivisionByZero: you are attempting to divide by zero in ${moduleName} plugin : inputs[${index}]\n`,
  MISSING_GLOBAL_CONFIG: 'Global config is not provided.',
  MISSING_INPUT_DATA: (param: string) =>
    `${param} is missing from the input array, or has nullish value.`,
  CONFIG_WARN: (plugins: string, isMore: boolean) =>
    `You have included node-level config in your manifest to support \`${plugins}\` plugin${
      isMore ? 's' : ''
    }. IF no longer supports node-level config. \`${plugins}\` plugin${
      isMore ? 's' : ''
    } should be refactored to accept all its config from global config or input data.`,
};
