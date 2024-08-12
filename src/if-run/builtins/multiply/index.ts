import {z} from 'zod';
import {
  ExecutePlugin,
  PluginParams,
  MultiplyConfig,
  PluginParametersMetadata,
  MappingParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';
import {mapConfigIfNeeded} from '../../../common/util/helpers';

export const Multiply = (
  globalConfig: MultiplyConfig,
  parametersMetadata: PluginParametersMetadata,
  mapping: MappingParams
): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs,
    outputs: parametersMetadata?.outputs,
  };

  /**
   * Checks global config value are valid.
   */
  const validateGlobalConfig = () => {
    const globalConfigSchema = z.object({
      'input-parameters': z.array(z.string()),
      'output-parameter': z.string().min(1),
    });

    return validate<z.infer<typeof globalConfigSchema>>(
      globalConfigSchema,
      globalConfig
    );
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
    globalConfig = mapConfigIfNeeded(globalConfig, mapping);

    const safeGlobalConfig = validateGlobalConfig();
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
