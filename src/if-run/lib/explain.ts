import {ERRORS} from '@grnsft/if-core/utils';

import {STRINGS} from '../../common/config';

import {ExplainParams, ExplainStorageType} from '../types/explain';

const {ManifestValidationError} = ERRORS;
const {AGGREGATION_UNITS_NOT_MATCH, AGGREGATION_METHODS_NOT_MATCH} = STRINGS;

/**
 * Retrieves stored explain data.
 */
export const explain = () => storeExplainData.parameters;

/**
 * Manages the storage of explain data.
 */
const storeExplainData = (() => {
  let parameter: ExplainStorageType = {};

  const parameterManager = {
    get parameters() {
      return parameter;
    },
    set parameters(value: ExplainStorageType) {
      parameter = value;
    },
  };

  return parameterManager;
})();

/**
 * Adds new explain data to the stored explain data.
 */
export const addExplainData = (params: ExplainParams) => {
  const {pluginName, pluginData, metadata} = params;
  const parameterMetadata = pluginData?.['parameter-metadata'] || metadata;
  const parameters = storeExplainData.parameters;
  const allParameters = {
    ...parameterMetadata?.inputs,
    ...parameterMetadata?.outputs,
  } as ExplainStorageType;

  Object.entries(allParameters).forEach(([name, meta]) => {
    const existingParameter = parameters[name];

    if (parameters[name]?.plugins?.includes(pluginName)) {
      return;
    }

    if (existingParameter) {
      if (meta.unit !== existingParameter.unit) {
        throw new ManifestValidationError(AGGREGATION_UNITS_NOT_MATCH(name));
      }

      if (
        meta['aggregation-method'].component !==
          existingParameter['aggregation-method'].component ||
        meta['aggregation-method'].time !==
          existingParameter['aggregation-method'].time
      ) {
        throw new ManifestValidationError(AGGREGATION_METHODS_NOT_MATCH(name));
      }

      existingParameter.plugins.push(pluginName);
      existingParameter.description =
        meta.description || existingParameter.description;
    } else {
      parameters[name] = {
        plugins: [pluginName],
        unit: meta.unit,
        description: meta.description,
        'aggregation-method': meta['aggregation-method'],
      };
    }
  });

  storeExplainData.parameters = {
    ...parameters,
  };
};
