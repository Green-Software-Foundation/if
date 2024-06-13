import {z} from 'zod';

import {ERRORS} from '../../util/errors';
import {validate} from '../../util/validations';

import {STRINGS} from '../../config';

import {ExecutePlugin, PluginParams, ConfigParams} from '../../types/interface';

const {GlobalConfigError, MissingInputDataError} = ERRORS;
const {MISSING_GLOBAL_CONFIG, MISSING_INPUT_DATA} = STRINGS;

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
      throw new GlobalConfigError(MISSING_GLOBAL_CONFIG);
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
    numerator: string,
    denominator: number | string
  ) => input[numerator] / (input[denominator] || denominator);

  return {
    metadata,
    execute,
  };
};
