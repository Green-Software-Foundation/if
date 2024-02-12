export const STRINGS = {
  FILE_IS_NOT_YAML: 'Provided impl file is not in yaml format.',
  IMPL_IS_MISSING: 'Impl file is missing.',
  MISSING_CLASSNAME: "Initalization param 'model' is missing.",
  MISSING_PATH: "Initalization param 'path' is missing.",
  OVERRIDE_WARNING:
    '\n**WARNING**: You are overriding the IF default parameters file. Please be extremely careful of unintended side-effects in your plugin pipeline!\n',
  NOT_PLUGIN_PLUGIN_EXTENSION:
    "Provided plugin does not extend 'PluginInterface'.",
  STRUCTURE_MALFORMED: (childName: string) =>
    `Graph is malformed: graph.children.${childName} is not valid.`,
  NOT_INITIALIZED_PLUGIN: (className: string) =>
    `You're trying to use not initalized plugin: ${className}.`,
  DISCLAIMER_MESSAGE: `
[!important] Incubation Project

This project is an incubation project being run inside the Green Software Foundation; as such, we *DON’T recommend using it in any critical use case. 
Incubation projects are experimental, offer no support guarantee, have minimal governance and process, and may be retired at any moment. This project may one day graduate, in which case this disclaimer will be removed.
`,
  NOT_NATIVE_PLUGIN: `
[!important]

You are using plugins that are not part of the Impact Framework standard library. You should do your own research to ensure the PLUGINs are up to date and accurate. They may not be actively maintained.  
`,
  SOMETHING_WRONG: 'Something wrong with cli arguments. Please check docs.',
  ISSUE_TEMPLATE: `
Impact Framework is an alpha release from the Green Software Foundation and is released to capture early feedback. If you'd like to offer some feedback, please use this issue template: 
https://github.com/Green-Software-Foundation/if/issues/new?assignees=&labels=feedback&projects=&template=feedback.md&title=Feedback+-+
`,
  INVALID_MODULE_PATH: (path: string) =>
    `Provided module path: '${path}' is invalid or not found.`,
  INVALID_TIME_NORMALIZATION: 'Start time or end time is missing.',
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
};
