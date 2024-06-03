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
      const sci =
        safeInput['carbon'] > 0
          ? safeInput['carbon'] / input[globalConfig['functional-unit']]
          : 0;
      return {
        ...input,
        sci,
      };
    });
  };

  /**
   * Checks for fields in input.
   */
  const validateInput = (input: PluginParams) => {
    const message = `'carbon' and ${globalConfig['functional-unit']} should be present in your input data.`;

    const validatedConfig = validateConfig(globalConfig);

    if (
      !(
        validatedConfig['functional-unit'] in input &&
        input[validatedConfig['functional-unit']] > 0
      )
    ) {
      throw new InputValidationError(
        errorBuilder({
          message:
            'functional-unit value is missing from input data or it is not a positive integer',
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
