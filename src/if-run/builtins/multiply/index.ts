import {z} from 'zod';
import {
  ExecutePlugin,
  PluginParams,
  MultiplyConfig,
  PluginParametersMetadata,
} from '@grnsft/if-core/types';
import {ERRORS} from '@grnsft/if-core/utils';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

export const Multiply = (
  config: MultiplyConfig,
  parametersMetadata: PluginParametersMetadata
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

    const configSchema = z.object({
      'input-parameters': z.array(z.string()),
      'output-parameter': z.string().min(1),
    });

    return validate<z.infer<typeof configSchema>>(configSchema, config);
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

      return {
        ...input,
        [outputParameter]: calculateProduct(input, inputParameters),
      };
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
