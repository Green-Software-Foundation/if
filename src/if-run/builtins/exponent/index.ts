import {z, ZodType} from 'zod';

import {PluginParams, ConfigParams} from '@grnsft/if-core/types';
import {PluginFactory} from '@grnsft/if-core/interfaces';
import {ERRORS} from '@grnsft/if-core/utils';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

export const Exponent = PluginFactory({
  configValidation: (config: ConfigParams) => {
    if (!config || !Object.keys(config)?.length) {
      throw new ConfigError(MISSING_CONFIG);
    }

    const configSchema = z.object({
      'input-parameter': z.string().min(1),
      exponent: z.number(),
      'output-parameter': z.string().min(1),
    });

    return validate<z.infer<typeof configSchema>>(
      configSchema as ZodType<any>,
      config
    );
  },
  inputValidation: (input: PluginParams, config: ConfigParams) => {
    const inputParameter = config['input-parameter'];
    const inputData = {
      [inputParameter]:
        typeof inputParameter === 'number'
          ? inputParameter
          : input[inputParameter],
    };
    const validationSchema = z.record(z.string(), z.number());

    return validate<z.infer<typeof validationSchema>>(
      validationSchema,
      inputData
    );
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams = {}) => {
    const {
      'input-parameter': inputParameter,
      exponent,
      'output-parameter': outputParameter,
    } = config;

    return inputs.map(input => {
      const calculatedResult = calculateExponent(
        input,
        inputParameter,
        exponent
      );

      return {
        ...input,
        [outputParameter]: calculatedResult,
      };
    });
  },
  allowArithmeticExpressions: ['input-parameter', 'exponent'],
});

/**
 * Calculates the input param raised by the power of a given exponent.
 */
const calculateExponent = (
  input: PluginParams,
  inputParameter: string | number,
  exponent: number
) => {
  const base =
    typeof inputParameter === 'number' ? inputParameter : input[inputParameter];

  return Math.pow(base, exponent);
};
