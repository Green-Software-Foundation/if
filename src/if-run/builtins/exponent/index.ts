import {z} from 'zod';

import {PluginParams, ConfigParams} from '@grnsft/if-core/types';
import {PluginFactory} from '@grnsft/if-core/interfaces';

import {validate} from '../../../common/util/validations';

export const Exponent = PluginFactory({
  metadata: {
    inputs: {},
    outputs: {},
  },
  configValidation: z.object({
    'input-parameter': z.string().min(1),
    exponent: z.number(),
    'output-parameter': z.string().min(1),
  }),
  inputValidation: (input: PluginParams, config: ConfigParams) => {
    const inputParameter = config['input-parameter'];
    const inputData = {
      [inputParameter]:
        typeof inputParameter === 'number'
          ? inputParameter
          : input[inputParameter],
    };
    const validationSchema = z.record(z.string(), z.number());

    return validate(validationSchema, inputData);
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
