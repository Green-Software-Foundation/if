export const STRINGS = {
  DISCLAIMER_MESSAGE: `
Incubation Project

This project is an incubation project being run inside the Green Software Foundation; as such, we DON’T recommend using it in any critical use case. 
Incubation projects are experimental, offer no support guarantee, have minimal governance and process, and may be retired at any moment. This project may one day graduate, in which case this disclaimer will be removed.`,
  SOURCE_IS_NOT_YAML: 'Given source file is not in yaml format.',
  TARGET_IS_NOT_YAML: 'Given target file is not in yaml format.',
  MANIFEST_NOT_FOUND: 'Manifest file not found.',
  SUCCESS_MESSAGE: 'The environment is successfully setup!',
  MANIFEST_IS_MISSING: 'Manifest is missing.',
  DIRECTORY_NOT_FOUND: 'Directory not found.',
  AGGREGATION_UNITS_NOT_MATCH: (param: string) =>
    `Your manifest uses two instances of ${param} with different units. Please check that you are using consistent units for ${param} throughout your manifest.`,
  AGGREGATION_METHODS_NOT_MATCH: (param: string) =>
    `Your manifest uses two instances of ${param} with different 'aggregation-method'. Please check that you are using right 'aggregation-method' for ${param} throughout your manifest.`,
};
