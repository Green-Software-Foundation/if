import {z} from 'zod';

import {ERRORS} from '../../util/errors';
import {validate} from '../../util/validations';

import {ExecutePlugin, PluginParams, ConfigParams} from '../../types/interface';

const {InputValidationError, ConfigNotFoundError} = ERRORS;

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

    return inputs.map(input => {
      const safeInput = Object.assign(
        {},
        input,
        validateSingleInput(input, numerator, denominator)
      );

      return {
        ...input,
        [output]: calculateDivide(safeInput, numerator, denominator),
      };
    });
  };

  /**
   * Checks global config value are valid.
   */
  const validateGlobalConfig = () => {
    if (!globalConfig) {
      throw new ConfigNotFoundError('Global config is not provided.');
    }

    const schema = z.object({
      numerator: z.string().min(1),
      denominator: z.string().or(z.number().gt(0)),
      output: z.string(),
    });

    return validate<z.infer<typeof schema>>(schema, globalConfig);
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (
    input: PluginParams,
    numerator: string,
    denominator: number | string
  ) => {
    const schema = z
      .object({
        [numerator]: z.number(),
        [denominator]: z.number().optional(),
      })
      .refine(_data => {
        if (typeof denominator === 'string' && !input[denominator]) {
          throw new InputValidationError(
            `\`${denominator}\` is missing from the input.`
          );
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
    numerator: string,
    denominator: number | string
  ) => input[numerator] / (input[denominator] || denominator);

  return {
    metadata,
    execute,
  };
};
