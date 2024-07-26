import {z} from 'zod';
import {
  ExecutePlugin,
  PluginParams,
  MultiplyConfig,
  PluginParametersMetadata,
  MappingParams,
} from '@grnsft/if-core/types';

import {PluginSettings} from '../../../common/types/manifest';
import {validate} from '../../../common/util/validations';
import {mapOutput} from '../../../common/util/helpers';

export const Multiply = (options: PluginSettings): ExecutePlugin => {
  const {
    'global-config': globalConfig,
    'parameter-metadata': parametersMetadata,
    mapping,
  } = options as {
    'global-config': MultiplyConfig;
    'parameter-metadata': PluginParametersMetadata;
    mapping: MappingParams;
  };
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
    const safeGlobalConfig = validateGlobalConfig();
    const inputParameters = safeGlobalConfig['input-parameters'];
    const outputParameter = safeGlobalConfig['output-parameter'];

    return inputs.map(input => {
      validateSingleInput(input, inputParameters);

      const output = {
        ...input,
        [outputParameter]: calculateProduct(input, inputParameters),
      };

      return mapOutput(output, mapping);
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
