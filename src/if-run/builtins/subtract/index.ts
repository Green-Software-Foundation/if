import {z} from 'zod';

import {PluginFactory} from '@grnsft/if-core/interfaces';
import {ConfigParams, PluginParams} from '@grnsft/if-core/types';
import {ERRORS} from '@grnsft/if-core/utils';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

export const Subtract = PluginFactory({
  metadata: {
    inputs: {},
    outputs: {},
  },
  configValidation: (config: ConfigParams) => {
    if (!config || !Object.keys(config)?.length) {
      throw new ConfigError(MISSING_CONFIG);
    }

    const configSchema = z.object({
      'input-parameters': z.array(z.string()),
      'output-parameter': z.string().min(1),
    });

    return validate<z.infer<typeof configSchema>>(configSchema, config);
  },
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
  implementation: async (inputs: PluginParams[], config: ConfigParams) => {
    const {
      'input-parameters': inputParameters,
      'output-parameter': outputParameter,
    } = config;

    return inputs.map(input => {
      const calculatedResult = calculateDiff(input, inputParameters);

      return {
        ...input,
        [outputParameter]: calculatedResult,
      };
    });
  },
  allowArithmeticExpressions: [],
});

/**
 * Calculates the diff between the 1st item in the inputs nad the rest of the items
 */
const calculateDiff = (input: PluginParams, inputParameters: string[]) => {
  const [firstItem, ...restItems] = inputParameters;

  return restItems.reduce(
    (accumulator, metricToSubtract) => accumulator - input[metricToSubtract],
    input[firstItem] // Starting accumulator with the value of the first item
  );
};
