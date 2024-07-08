import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {ExecutePlugin, PluginParams, ConfigParams} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {GlobalConfigError, MissingInputDataError} = ERRORS;
const {MISSING_GLOBAL_CONFIG, MISSING_INPUT_DATA, ZERO_DIVISION} = STRINGS;

export const Divide = (globalConfig: ConfigParams): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
  };

  /**
   * Calculate the division of each input parameter.
   */
  const execute = (inputs: PluginParams[]) => {
    const safeGlobalConfig = validateGlobalConfig();
    const {numerator, denominator, output} = safeGlobalConfig;

    return inputs.map((input, index) => {
      const safeInput = Object.assign(
        {},
        input,
        validateSingleInput(input, {numerator, denominator})
      );

      return {
        ...input,
        [output]: calculateDivide(safeInput, index, {numerator, denominator}),
      };
    });
  };

  /**
   * Checks global config value are valid.
   */
  const validateGlobalConfig = () => {
    if (!globalConfig) {
      throw new GlobalConfigError(MISSING_GLOBAL_CONFIG);
    }

    const schema = z.object({
      numerator: z.string().min(1),
      denominator: z.string().or(z.number()),
      output: z.string(),
    });

    return validate<z.infer<typeof schema>>(schema, globalConfig);
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (
    input: PluginParams,
    params: {
      numerator: string;
      denominator: number | string;
    }
  ) => {
    const {numerator, denominator} = params;

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
  };

  /**
   * Calculates the division of the given parameter.
   */
  const calculateDivide = (
    input: PluginParams,
    index: number,
    params: {
      numerator: string;
      denominator: number | string;
    }
  ) => {
    const {denominator, numerator} = params;
    const finalDenominator = input[denominator] || denominator;

    if (finalDenominator === 0) {
      console.warn(ZERO_DIVISION(Divide.name, index));
      return input[numerator];
    }

    return input[numerator] / finalDenominator;
  };

  return {
    metadata,
    execute,
  };
};
