import {z} from 'zod';
import {
  mapConfigIfNeeded,
  mapOutputIfNeeded,
} from '@grnsft/if-core/utils/helpers';
import {
  ExecutePlugin,
  PluginParams,
  ExponentConfig,
  PluginParametersMetadata,
  MappingParams,
} from '@grnsft/if-core/types';
import {ERRORS} from '@grnsft/if-core/utils';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

export const Exponent = (
  config: ExponentConfig,
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
      'input-parameter': z.string().min(1),
      exponent: z.number(),
      'output-parameter': z.string().min(1),
    });

    return validate<z.infer<typeof configSchema>>(configSchema, mappedConfig);
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

      const result = {
        ...input,
        [outputParameter]: calculateExponent(input, inputParameter, exponent),
      };

      return mapOutputIfNeeded(result, mapping);
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
