import {ManifestParameter} from '../types/manifest';

export const STRINGS = {
  MANIFEST_IS_MISSING: 'Manifest is missing.',
  MISSING_METHOD: "Initalization param 'method' is missing.",
  MISSING_PATH: "Initalization param 'path' is missing.",
  UNSUPPORTED_PLUGIN:
    "Plugin interface doesn't implement 'execute' or 'metadata' methods.",
  OVERRIDE_WARNING:
    '\n**WARNING**: You are overriding the IF default parameters file. Please be extremely careful of unintended side-effects in your plugin pipeline!\n',
  DISCLAIMER_MESSAGE: `
Incubation Project

This project is an incubation project being run inside the Green Software Foundation; as such, we DON’T recommend using it in any critical use case. 
Incubation projects are experimental, offer no support guarantee, have minimal governance and process, and may be retired at any moment. This project may one day graduate, in which case this disclaimer will be removed.`,
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
  INVALID_GROUP_BY: (type: string) => `Invalid group ${type}.`,
  REJECTING_OVERRIDE: (param: ManifestParameter) =>
    `Rejecting overriding of canonical parameter: ${param.name}.`,
  INVALID_EXHAUST_PLUGIN: (pluginName: string) =>
    `Invalid exhaust plugin: ${pluginName}.`,
  UNKNOWN_PARAM: (name: string) =>
    `Unknown parameter: ${name}. Using 'sum' aggregation method.`,
  NOT_INITALIZED_PLUGIN: (name: string) =>
    `Not initalized plugin: ${name}. Check if ${name} is in 'manifest.initalize.plugins'.`,
  NO_OUTPUT: `
You have not selected an output method. To see your output data, you can choose from:
--stdout: this will print your output data to the console
--output <savepath>: this will save your output data to the given filepath (do not provide file extension)
Note that for the '--output' option you also need to define the output type in your manifest file. See https://if.greensoftware.foundation/major-concepts/manifest-file#initialize`,
  SOURCE_IS_NOT_YAML: 'Given source file is not in yaml format.',
  TARGET_IS_NOT_YAML: 'Given target file is not in yaml format.',
  INVALID_TARGET: 'Target is invalid.',
  INVALID_SOURCE: 'Source is invalid.',
  UNSUPPORTED_ERROR: (errorName: string) =>
    `UnsupportedErrorClass: plugin threw error class: ${errorName} that is not recognized by Impact Framework`,
  /** Plugin messages */
  MISSING_GLOBAL_CONFIG: 'Global config is not provided.',
  MISSING_INPUT_DATA: (param: string) =>
    `${param} is missing from the input array, or has nullish value.`,
  MANIFEST_NOT_FOUND: 'Manifest file not found.',
  INITIALIZING_PACKAGE_JSON: 'Initializing package.json.',
  INSTALLING_NPM_PACKAGES: 'Installing npm packages...',
  NOT_NUMERIC_VALUE: (str: any) => `${str} is not numberic.`,
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
  /** Exhaust messages */
  OUTPUT_REQUIRED:
    'Output path is required, please make sure output is configured properly.',
  CSV_EXPORT:
    'CSV export criteria is not found in output path. Please append it after --output <path>#.',
  WRITE_CSV_ERROR: (outputPath: string, error: any) =>
    `Failed to write CSV file to ${outputPath}: ${error}`,
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
  /** Debugging logs */
  STARTING_IF: 'Starting IF',
  EXITING_IF: 'Exiting IF',
  LOADING_MANIFEST: 'Loading manifest',
  VALIDATING_MANIFEST: 'Validating manifest',
  CAPTURING_RUNTIME_ENVIRONMENT_DATA: 'Capturing runtime environment data',
  SYNCING_PARAMETERS: 'Syncing parameters',
  CHECKING_AGGREGATION_METHOD: (unitName: string) =>
    `Checking aggregation method for ${unitName}`,
  INITIALIZING_PLUGINS: 'Initializing plugins',
  INITIALIZING_PLUGIN: (pluginName: string) => `Initializing ${pluginName}`,
  LOADING_PLUGIN_FROM_PATH: (pluginName: string, path: string) =>
    `Loading ${pluginName} from ${path}`,
  COMPUTING_PIPELINE_FOR_NODE: (nodeName: string) =>
    `Computing pipeline for \`${nodeName}\``,
  MERGING_DEFAULTS_WITH_INPUT_DATA: 'Merging defaults with input data',
  AGGREGATING_OUTPUTS: 'Aggregating outputs',
  AGGREGATING_NODE: (nodeName: string) => `Aggregating node ${nodeName}`,
  PREPARING_OUTPUT_DATA: 'Preparing output data',
  EXPORTING_TO_YAML_FILE: (savepath: string) =>
    `Exporting to yaml file: ${savepath}`,
  EXPORTING_TO_CSV_FILE: (savepath: string) =>
    `Exporting to csv file: ${savepath}`,
  EXPORTING_RAW_CSV_FILE: (savepath: string) =>
    `Exporting raw csv file: ${savepath}`,
  CHECKING: 'Checking...',
  IF_CHECK_FLAGS_MISSING:
    'Either the `--manifest` or `--directory` command should be provided with a path',
  DIRECTORY_NOT_FOUND: 'Directory not found.',
  IF_CHECK_FAILED: (filename: string) =>
    `if-check could not verify <${filename}>. The re-executed file does not match the original.\n`,
  IF_CHECK_VERIFIED: (filename: string) =>
    `if-check successfully verified <${filename}>\n`,
  ZERO_DIVISION: (moduleName: string, index: number) =>
    `-- SKIPPING -- DivisionByZero: you are attempting to divide by zero in ${moduleName} plugin : inputs[${index}]\n`,
};
