import {z} from 'zod';
import {PluginFactory} from '@grnsft/if-core/interfaces';
import {ConfigParams, PluginParams} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

export const Coefficient = PluginFactory({
  metadata: {
    inputs: {},
    outputs: {},
  },
  configValidation: z.object({
    coefficient: z.number(),
    'input-parameter': z.string().min(1),
    'output-parameter': z.string().min(1),
  }),
  inputValidation: (input: PluginParams, config: ConfigParams) => {
    const inputData = {
      'input-parameter': input[config['input-parameter']],
    };
    const validationSchema = z.record(z.string(), z.number());
    validate(validationSchema, inputData);

    return input;
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams = {}) => {
    const {
      'input-parameter': inputParameter,
      'output-parameter': outputParameter,
      coefficient,
    } = config;

    return inputs.map(input => ({
      ...input,
      [outputParameter]: calculateProduct(input, inputParameter, coefficient),
    }));
  },
  allowArithmeticExpressions: ['input-parameter', 'coefficient'],
});

/**
 * Calculates the product of the energy components.
 */
const calculateProduct = (
  input: PluginParams,
  inputParameter: string | number,
  coefficient: number
) =>
  (isNaN(Number(inputParameter)) ? input[inputParameter] : inputParameter) *
  coefficient;
