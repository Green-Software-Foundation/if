import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {
  ExecutePlugin,
  PluginParams,
  SumConfig,
  PluginParametersMetadata,
  MappingParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';
import {
  mapConfigIfNeeded,
  mapOutputIfNeeded,
} from '../../../common/util/helpers';

import {STRINGS} from '../../config';

const {ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

export const Sum = (
  config: SumConfig,
  parametersMetadata: PluginParametersMetadata,
  mapping: MappingParams
): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs,
    outputs: parametersMetadata?.outputs,
  };

  /**
   * Calculate the sum of each input-paramters.
   */
  const execute = (inputs: PluginParams[]) => {
    const safeGlobalConfig = validateConfig();
    const inputParameters = safeGlobalConfig['input-parameters'];
    const outputParameter = safeGlobalConfig['output-parameter'];

    return inputs.map(input => {
      validateSingleInput(input, inputParameters);

      const result = {
        ...input,
        [outputParameter]: calculateSum(input, inputParameters),
      };

      return mapOutputIfNeeded(result, mapping);
    });
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
   * Calculates the sum of the energy components.
   */
  const calculateSum = (input: PluginParams, inputParameters: string[]) =>
    inputParameters.reduce(
      (accumulator, metricToSum) => accumulator + input[metricToSum],
      0
    );

  return {
    metadata,
    execute,
  };
};
