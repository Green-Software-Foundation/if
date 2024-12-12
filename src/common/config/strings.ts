export const STRINGS = {
  DISCLAIMER_MESSAGE: `
Graduated Project

This project is a Graduated Project, supported by the Green Software Foundation. The publicly available version documented in the README is trusted by the GSF. New versions of the project may be released, or it may move to the Maintained or Retired Stage at any moment.`,
  SOURCE_IS_NOT_YAML: 'Given source file is not in yaml format.',
  TARGET_IS_NOT_YAML: 'Given target file is not in yaml format.',
  MANIFEST_NOT_FOUND: 'Manifest file not found.',
  SUCCESS_MESSAGE: 'The environment is successfully setup!',
  MANIFEST_IS_MISSING: 'Manifest is missing.',
  DIRECTORY_NOT_FOUND: 'Directory not found.',
  AGGREGATION_UNITS_NOT_MATCH: (param: string) =>
    `Your manifest uses two instances of \`${param}\` with different units. Please check that you are using consistent units for \`${param}\` throughout your manifest.`,
  AGGREGATION_METHODS_NOT_MATCH: (param: string) =>
    `Your manifest uses two instances of \`${param}\` with different 'aggregation-method'. Please check that you are using right 'aggregation-method' for \`${param}\` throughout your manifest.`,
  MISSING_INPUTS_PARAMETER: (pluginName: string) =>
    `The inputs parameter metadata of the \`${pluginName}\` plugin is missing.`,
  MISSING_OUTPUTS_PARAMETER: (pluginName: string) =>
    `The outputs parameter metadata of the \`${pluginName}\` plugin is missing.`,
};
