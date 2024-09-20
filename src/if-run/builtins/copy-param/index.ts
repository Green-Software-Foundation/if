import {z} from 'zod';
import {PluginFactory} from '@grnsft/if-core/interfaces';
import {ConfigParams, PluginParams} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

/**
 * keep-existing: true/false (whether to remove the parameter you are copying from)
 * from-param: the parameter you are copying from (e.g. cpu/name)
 * to-field: the parameter you are copying to (e.g. cpu/processor-name)
 */

export const Copy = PluginFactory({
  metadata: {
    inputs: {},
    outputs: {},
  },
  configValidation: z.object({
    'keep-existing': z.boolean(),
    from: z.string().min(1).or(z.number()),
    to: z.string().min(1),
  }),
  inputValidation: (input: PluginParams, config: ConfigParams) => {
    const from = config.from;
    const inputData = {
      [from]: input[from],
    };
    const validationSchema = z.record(z.string(), z.string().or(z.number()));

    return validate(validationSchema, inputData);
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams = {}) => {
    const keepExisting = config['keep-existing'] === true;
    const from = config['from'];
    const to = config['to'];

    return inputs.map(input => {
      const outputValue = !isNaN(config?.from) ? config.from : input[from];

      if (input[from]) {
        if (!keepExisting) {
          delete input[from];
        }
      }

      return {
        ...input,
        [to]: outputValue,
      };
    });
  },
  allowArithmeticExpressions: ['from'],
});
