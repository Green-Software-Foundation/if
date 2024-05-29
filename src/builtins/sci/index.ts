import {z} from 'zod';

import {ExecutePlugin, PluginParams} from '../../types/interface';
import {ConfigParams} from '../../types/common';

import {validate, allDefined} from '../../util/validations';
import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';

const {InputValidationError} = ERRORS;

export const Sci = (globalConfig: ConfigParams): ExecutePlugin => {
  const errorBuilder = buildErrorMessage(Sci.name);
  const metadata = {
    kind: 'execute',
  };

  /**
   * Validates node and gloabl configs.
   */
  const validateConfig = (config?: ConfigParams) => {
    const errorMessage =
      '`functional-unit` should be provided in your global config';

    const schema = z
      .object({
        'functional-unit': z.string(),
      })
      .refine(data => data['functional-unit'], {
        message: errorMessage,
      });

    return validate<z.infer<typeof schema>>(schema, config);
  };

  /**
   * Calculate the total emissions for a list of inputs.
   */
  const execute = (inputs: PluginParams[]): PluginParams[] => {
    return inputs.map(input => {
      const safeInput = validateInput(input);
      let sci = 0;
      if (safeInput['carbon'] > 0) {
        sci = safeInput['carbon'] / input[globalConfig['functional-unit']];
      }
      return {
        ...input,
        sci,
      };
    });
  };

  /**
   * Converts the given sci value from seconds to the specified time unit.
   */
  // const convertSciToTimeUnit = (
  //   sciPerSecond: number,
  //   functionalUnitTime: { unit: string; value: number }
  // ): number => {
  //   const conversionFactor = TIME_UNITS_IN_SECONDS[functionalUnitTime.unit];

  /**
   * Checks for fields in input.
   */
  const validateInput = (input: PluginParams) => {
    const message = `'carbon' and ${globalConfig['functional-unit']} should be present in your input data.`;

    const validatedConfig = validateConfig(globalConfig);

    if (!(validatedConfig['functional-unit'] in input)) {
      throw new InputValidationError(
        errorBuilder({
          message: 'functional-unit value is missing from input data',
        })
      );
    }

    const schema = z
      .object({
        carbon: z.number().gte(0),
        duration: z.number().gte(1),
      })
      .refine(allDefined, {message});

    return validate<z.infer<typeof schema>>(schema, input);
  };

  return {
    metadata,
    execute,
  };
};
