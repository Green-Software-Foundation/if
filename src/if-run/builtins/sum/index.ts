import {z} from 'zod';
import {
  ERRORS,
  evaluateInput,
  evaluateConfig,
  evaluateArithmeticOutput,
  validateArithmeticExpression,
} from '@grnsft/if-core/utils';
import {
  mapConfigIfNeeded,
  mapOutputIfNeeded,
} from '@grnsft/if-core/utils/helpers';
import {
  ExecutePlugin,
  PluginParams,
  SumConfig,
  PluginParametersMetadata,
  MappingParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

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
    const safeConfig = validateConfig();
    const {
      'input-parameters': inputParameters,
      'output-parameter': outputParameter,
    } = safeConfig;

    return inputs.map(input => {
      const safeInput = validateSingleInput(input, inputParameters);

      const calculatedConfig = evaluateConfig({
        config: safeConfig,
        input,
        parametersToEvaluate: config['input-parameters'],
      });

      const calculatedResult = calculateSum(
        safeInput,
        calculatedConfig['input-parameters'] || inputParameters
      );

      const result = {
        ...input,
        ...safeInput,
        ...evaluateArithmeticOutput(outputParameter, calculatedResult),
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
      'output-parameter': z
        .string()
        .min(1)
        .refine(value =>
          validateArithmeticExpression('output-parameter', value)
        ),
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
    const evaluatedInput = evaluateInput(input);
    const inputData = inputParameters.reduce(
      (acc, param) => {
        acc[param] = evaluatedInput[param];

        return acc;
      },
      {} as Record<string, number>
    );
    const validationSchema = z.record(z.string(), z.number());
    return validate(validationSchema, inputData);
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
