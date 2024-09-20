import {z} from 'zod';
import {PluginFactory} from '@grnsft/if-core/interfaces';
import {ConfigParams, PluginParams} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {ERRORS} from '@grnsft/if-core/utils';

import {STRINGS} from '../../config';

const {MissingInputDataError} = ERRORS;
const {MISSING_INPUT_DATA, ZERO_DIVISION} = STRINGS;
export const Divide = PluginFactory({
  metadata: {
    inputs: {},
    outputs: {},
  },
  configValidation: z.object({
    numerator: z.string().min(1),
    denominator: z.string().or(z.number()),
    output: z.string(),
  }),
  inputValidation: (input: PluginParams, config: ConfigParams) => {
    const {numerator, denominator} = config;

    const schema = z
      .object({
        [numerator]: z.number(),
        [denominator]: z.number().optional(),
      })
      .refine(() => {
        if (typeof denominator === 'string' && !input[denominator]) {
          throw new MissingInputDataError(MISSING_INPUT_DATA(denominator));
        }

        return true;
      });

    return validate<z.infer<typeof schema>>(schema, input);
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams = {}) => {
    const {numerator, denominator, output} = config;

    return inputs.map((input, index) => {
      const calculatedResult = calculateDivide(input, index, {
        numerator: input.numerator || numerator,
        denominator: input.denominator || denominator,
      });

      return {
        ...input,
        [output]: calculatedResult,
      };
    });
  },
  allowArithmeticExpressions: ['numerator', 'denominator'],
});

/**
 * Calculates the division of the given parameter.
 */
const calculateDivide = (
  input: PluginParams,
  index: number,
  params: {
    numerator: number | string;
    denominator: number | string;
  }
) => {
  const {denominator, numerator} = params;
  const finalDenominator =
    typeof denominator === 'number'
      ? denominator
      : input[denominator] || denominator;
  const finalNumerator =
    typeof numerator === 'number' ? numerator : input[numerator];

  if (finalDenominator === 0) {
    console.warn(ZERO_DIVISION(Divide.name, index));
    return finalNumerator;
  }

  return finalNumerator / finalDenominator;
};
