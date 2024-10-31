import {ParameterMetadata} from '@grnsft/if-core/types';
import {ERRORS} from '@grnsft/if-core/utils';

import {STRINGS} from '../../common/config';

import {logger} from '../../common/util/logger';

import {ExplainParams, ExplainStorageType} from '../types/explain';

const {ManifestValidationError} = ERRORS;
const {
  AGGREGATION_UNITS_NOT_MATCH,
  AGGREGATION_METHODS_NOT_MATCH,
  MISSING_INPUTS_PARAMETER,
  MISSING_OUTPUTS_PARAMETER,
} = STRINGS;

/**
 * Retrieves stored explain data.
 */
export const explain = () => storeExplainData.plugins;

/**
 * Manages the storage of explain data.
 */
const storeExplainData = (() => {
  let plugins: ExplainStorageType = {};

  const pluginManager = {
    get plugins() {
      return plugins;
    },
    set plugins(value: ExplainStorageType) {
      plugins = value;
    },
  };

  return pluginManager;
})();

/**
 * Adds new explain data to the stored explain data.
 */
export const addExplainData = (params: ExplainParams) => {
  const {pluginName, metadata} = params;
  const plugin: ExplainStorageType = {
    [pluginName]: {
      inputs: metadata?.inputs ?? {},
      outputs: metadata?.outputs ?? {},
    },
  };

  const isInputsMissing = !Object.keys(plugin[pluginName].inputs || {}).length;
  const isOutputsMissing = !Object.keys(plugin[pluginName].outputs || {})
    .length;

  if (isInputsMissing) {
    delete plugin[pluginName].inputs;

    logger.warn(MISSING_INPUTS_PARAMETER(pluginName));
  }

  if (isOutputsMissing) {
    delete plugin[pluginName].outputs;

    logger.warn(MISSING_OUTPUTS_PARAMETER(pluginName));
  }

  checkMetadatas(metadata);

  if (!isInputsMissing || !isOutputsMissing) {
    storeExplainData.plugins = {
      ...storeExplainData.plugins,
      ...plugin,
    };
  }
};

/**
 * Checks if the 'unit' and 'aggregation-method' of the parameter are the same throughout the manifest
 */
const checkMetadatas = (metadata: {
  inputs?: ParameterMetadata;
  outputs?: ParameterMetadata;
}) => {
  const inputsOutputsMetadata = {...metadata?.inputs, ...metadata?.outputs};
  const storedParameters: any = {};

  // Populate stored parameters with metadata from each plugin
  Object.values(storeExplainData.plugins).forEach(plugin => {
    const storedInputOutputMetadata = {...plugin.inputs, ...plugin.outputs};

    Object.keys(storedInputOutputMetadata).forEach(parameter => {
      if (!storedParameters[parameter]) {
        storedParameters[parameter] = {
          unit: storedInputOutputMetadata[parameter].unit,
          'aggregation-method':
            storedInputOutputMetadata[parameter]['aggregation-method'],
        };
      }
    });
  });

  // Validate input-output metadata against stored parameters
  Object.keys(inputsOutputsMetadata).forEach(parameterName => {
    const parameter = inputsOutputsMetadata[parameterName];
    const storedParameter = storedParameters[parameterName];

    if (
      parameter &&
      Object.keys(storedParameters).includes(parameterName) &&
      storedParameter.unit !== parameter.unit
    ) {
      throw new ManifestValidationError(
        AGGREGATION_UNITS_NOT_MATCH(parameterName)
      );
    }

    // Check for aggregation-method mismatch
    const inputAggregation = parameter['aggregation-method'];

    if (
      storedParameter &&
      (storedParameter['aggregation-method']?.component !==
        inputAggregation?.component ||
        storedParameter['aggregation-method']?.time !== inputAggregation?.time)
    ) {
      throw new ManifestValidationError(
        AGGREGATION_METHODS_NOT_MATCH(parameterName)
      );
    }
  });
};
