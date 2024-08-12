import {z} from 'zod';
import {
  ExecutePlugin,
  PluginParams,
  ExponentConfig,
  PluginParametersMetadata,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

export const Exponent = (
  config: ExponentConfig,
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
    const configSchema = z.object({
      'input-parameter': z.string().min(1),
      exponent: z.number(),
      'output-parameter': z.string().min(1),
    });

    return validate<z.infer<typeof configSchema>>(configSchema, config);
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (input: PluginParams, inputParameter: string) => {
    const inputData = {
      'input-parameter': input[inputParameter],
    };
    const validationSchema = z.record(z.string(), z.number());
    validate(validationSchema, inputData);

    return input;
  };

  /**
   * Calculate the input param raised by to the power of the given exponent.
   */
  const execute = (inputs: PluginParams[]): PluginParams[] => {
    const {
      'input-parameter': inputParameter,
      exponent,
      'output-parameter': outputParameter,
    } = validateConfig();

    return inputs.map(input => {
      validateSingleInput(input, inputParameter);

      return {
        ...input,
        [outputParameter]: calculateExponent(input, inputParameter, exponent),
      };
    });
  };

  /**
   * Calculates the input param raised by the power of a given exponent.
   */
  const calculateExponent = (
    input: PluginParams,
    inputParameter: string,
    exponent: number
  ) => {
    const base = input[inputParameter];

    return Math.pow(base, exponent);
  };

  return {
    metadata,
    execute,
  };
};
