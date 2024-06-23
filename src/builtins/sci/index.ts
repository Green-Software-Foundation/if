import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {ExecutePlugin, PluginParams, ConfigParams} from '@grnsft/if-core/types';

import {validate, allDefined} from '../../util/validations';

import {STRINGS} from '../../config';

const {MissingInputDataError} = ERRORS;
const {
  MISSING_FUNCTIONAL_UNIT_CONFIG,
  MISSING_FUNCTIONAL_UNIT_INPUT,
  ZERO_DIVISION,
} = STRINGS;

export const Sci = (globalConfig: ConfigParams): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
  };

  /**
   * Validates node and gloabl configs.
   */
  const validateConfig = (config?: ConfigParams) => {
    const schema = z
      .object({
        'functional-unit': z.string(),
      })
      .refine(data => data['functional-unit'], {
        message: MISSING_FUNCTIONAL_UNIT_CONFIG,
      });

    return validate<z.infer<typeof schema>>(schema, config);
  };

  /**
   * Calculate the total emissions for a list of inputs.
   */
  const execute = (inputs: PluginParams[]): PluginParams[] =>
    inputs.map((input, index) => {
      const safeInput = validateInput(input);
      const functionalUnit = input[globalConfig['functional-unit']];

      let sci: any = {};

      if (safeInput['carbon'] > 0) {
        if (functionalUnit === 0) {
          console.warn(ZERO_DIVISION(Sci.name, index));
          sci = safeInput['carbon'];
        } else {
          sci = safeInput['carbon'] / functionalUnit;
        }
      } else {
        sci = 0;
      }

      return {
        ...input,
        sci,
      };
    });

  /**
   * Checks for fields in input.
   */
  const validateInput = (input: PluginParams) => {
    const message = `'carbon' and ${globalConfig['functional-unit']} should be present in your input data.`;

    const validatedConfig = validateConfig(globalConfig);

    if (
      !(
        validatedConfig['functional-unit'] in input &&
        input[validatedConfig['functional-unit']] >= 0
      )
    ) {
      throw new MissingInputDataError(MISSING_FUNCTIONAL_UNIT_INPUT);
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
