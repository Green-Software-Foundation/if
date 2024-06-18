import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {ExecutePlugin, PluginParams, ConfigParams} from '@grnsft/if-core/types';

import {validate, allDefined} from '../../util/validations';

import {STRINGS} from '../../config';

const {MissingInputDataError} = ERRORS;
const {MISSING_FUNCTIONAL_UNIT_CONFIG, MISSING_FUNCTIONAL_UNIT_INPUT} = STRINGS;

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
    inputs.map(input => {
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
