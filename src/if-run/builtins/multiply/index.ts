import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {
  mapConfigIfNeeded,
  mapOutputIfNeeded,
} from '@grnsft/if-core/utils/helpers';
import {
  ExecutePlugin,
  PluginParams,
  MultiplyConfig,
  PluginParametersMetadata,
  MappingParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

export const Multiply = (
  config: MultiplyConfig,
  parametersMetadata: PluginParametersMetadata,
  mapping: MappingParams
): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs,
    outputs: parametersMetadata?.outputs,
  };

  /**
   * Checks config value are valid.
   */
  const validateConfig = () => {
    if (!config) {
      throw new ConfigError(MISSING_CONFIG);
    }

    const mappedConfig = mapConfigIfNeeded(config, mapping);

    const configSchema = z.object({
      'input-parameters': z.array(z.string()),
      'output-parameter': z.string().min(1),
    });

    return validate<z.infer<typeof configSchema>>(configSchema, mappedConfig);
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (
    input: PluginParams,
    inputParameters: string[]
  ) => {
    const inputData = inputParameters.reduce(
      (acc, param) => {
        acc[param] = input[param];

        return acc;
      },
      {} as Record<string, number>
    );

    const validationSchema = z.record(z.string(), z.number());

    validate(validationSchema, inputData);

    return input;
  };

  /**
   * Calculate the product of each input parameter.
   */
  const execute = (inputs: PluginParams[]): PluginParams[] => {
    const safeGlobalConfig = validateConfig();
    const inputParameters = safeGlobalConfig['input-parameters'];
    const outputParameter = safeGlobalConfig['output-parameter'];

    return inputs.map(input => {
      validateSingleInput(input, inputParameters);

      const result = {
        ...input,
        [outputParameter]: calculateProduct(input, inputParameters),
      };

      return mapOutputIfNeeded(result, mapping);
    });
  };

  /**
   * Calculates the product of the components.
   */
  const calculateProduct = (input: PluginParams, inputParameters: string[]) =>
    inputParameters.reduce(
      (accumulator, metricToMultiply) => accumulator * input[metricToMultiply],
      1
    );

  return {
    metadata,
    execute,
  };
};
