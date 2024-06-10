import {z} from 'zod';

import {ERRORS} from '../../util/errors';
import {validate} from '../../util/validations';

import {STRINGS} from '../../config';

import {ExecutePlugin, PluginParams} from '../../types/interface';
import {ExponentConfig} from './types';

const {MissingInputDataError, InputValidationError} = ERRORS;
const {MISSING_INPUT_DATA, NOT_NUMERIC_VALUE} = STRINGS;

export const Exponent = (globalConfig: ExponentConfig): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
  };

  /**
   * Checks global config value are valid.
   */
  const validateGlobalConfig = () => {
    const globalConfigSchema = z.object({
      'input-parameter': z.string().min(1),
      exponent: z.number().min(1),
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
  const validateSingleInput = (input: PluginParams, inputParameter: string) => {
    validateParamExists(input, inputParameter);
    validateNumericString(input[inputParameter]);
  };

  const validateParamExists = (input: PluginParams, param: string) => {
    if (input[param] === undefined) {
      throw new MissingInputDataError(MISSING_INPUT_DATA(param));
    }
  };

  const validateNumericString = (str: string) => {
    if (isNaN(+Number(str))) {
      throw new InputValidationError(NOT_NUMERIC_VALUE(str));
    }
  };

  /**
   * Calculate the input param raised by to the power of the given exponent.
   */
  const execute = (inputs: PluginParams[]): PluginParams[] => {
    const {
      'input-parameter': inputParameter,
      exponent: exponent,
      'output-parameter': outputParameter,
    } = validateGlobalConfig();
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
