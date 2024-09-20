import {z} from 'zod';

import {PluginParams, ConfigParams} from '@grnsft/if-core/types';
import {PluginFactory} from '@grnsft/if-core/interfaces';

import {validate} from '../../../common/util/validations';

export const Multiply = PluginFactory({
  metadata: {
    inputs: {},
    outputs: {},
  },
  configValidation: z.object({
    'input-parameters': z.array(z.string()),
    'output-parameter': z.string().min(1),
  }),
  inputValidation: (input: PluginParams, config: ConfigParams) => {
    const inputParameters = config['input-parameters'];

    const inputData = inputParameters.reduce(
      (acc: {[x: string]: any}, param: string | number) => {
        acc[param] = input[param];

        return acc;
      },
      {} as Record<string, number>
    );

    const validationSchema = z.record(z.string(), z.number());

    return validate(validationSchema, inputData);
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams = {}) => {
    const {
      'input-parameters': inputParameters,
      'output-parameter': outputParameter,
    } = config;

    return inputs.map(input => {
      const calculatedResult = calculateProduct(input, inputParameters);

      return {
        ...input,
        [outputParameter]: calculatedResult,
      };
    });
  },
  allowArithmeticExpressions: [],
});

/**
 * Calculates the product of the components.
 */
const calculateProduct = (input: PluginParams, inputParameters: string[]) =>
  inputParameters.reduce(
    (accumulator, metricToMultiply) => accumulator * input[metricToMultiply],
    1
  );
