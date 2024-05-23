import {ManifestParameter} from '../types/manifest';

export const STRINGS = {
  FILE_IS_NOT_YAML: 'Provided manifest is not in yaml format.',
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
  SOMETHING_WRONG: 'Something wrong with cli arguments. Please check docs.',
  ISSUE_TEMPLATE: `
Impact Framework is an alpha release from the Green Software Foundation and is released to capture early feedback. If you'd like to offer some feedback, please use this issue template: 
https://github.com/Green-Software-Foundation/if/issues/new?assignees=&labels=feedback&projects=&template=feedback.md&title=Feedback+-+`,
  INVALID_MODULE_PATH: (path: string) =>
    `Provided module: '${path}' is invalid or not found.`,
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
  INVALID_OBSERVATION_OVERLAP: 'Observation timestamps overlap.',
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
  TARGET_IS_NOT_YAML: 'Given target is not in yaml format.',
  INVALID_TARGET: 'Target is invalid.',
  INVALID_SOURCE: 'Source is invalid.',
};
