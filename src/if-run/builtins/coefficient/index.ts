import {z, ZodType} from 'zod';

import {ERRORS, validateArithmeticExpression} from '@grnsft/if-core/utils';
import {ConfigParams, PluginParams} from '@grnsft/if-core/types';
import {PluginFactory} from '@grnsft/if-core/interfaces';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

export const Coefficient = PluginFactory({
  metadata: {
    inputs: {},
    outputs: {},
  },
  configValidation: (config: ConfigParams) => {
    if (!config || !Object.keys(config)?.length) {
      throw new ConfigError(MISSING_CONFIG);
    }

    const configSchema = z.object({
      coefficient: z.preprocess(
        value => validateArithmeticExpression('coefficient', value, 'number'),
        z.number()
      ),
      'input-parameter': z.string().min(1),
      'output-parameter': z.string().min(1),
    });

    return validate<z.infer<typeof configSchema>>(
      configSchema as ZodType<any>,
      config
    );
  },
  inputValidation: (input: PluginParams, config: ConfigParams) => {
    const inputData = {
      'input-parameter': input[config['input-parameter']],
    };
    const validationSchema = z.record(z.string(), z.number());
    validate(validationSchema, inputData);

    return input;
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams) => {
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
