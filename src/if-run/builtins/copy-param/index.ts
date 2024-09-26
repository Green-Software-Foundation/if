import {z} from 'zod';

import {
  ERRORS,
  getParameterFromArithmeticExpression,
} from '@grnsft/if-core/utils';
import {ConfigParams, PluginParams} from '@grnsft/if-core/types';
import {PluginFactory} from '@grnsft/if-core/interfaces';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

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
  configValidation: (config: ConfigParams) => {
    if (!config || !Object.keys(config)?.length) {
      throw new ConfigError(MISSING_CONFIG);
    }

    const configSchema = z.object({
      'keep-existing': z.boolean(),
      from: z.string().min(1),
      to: z.string().min(1),
    });

    const extractedFrom = getParameterFromArithmeticExpression(config.from);
    const updatedConfig = config['keep-existing']
      ? config
      : {...config, 'pure-from': extractedFrom};

    validate<z.infer<typeof configSchema>>(configSchema, updatedConfig);

    return updatedConfig;
  },
  inputValidation: (input: PluginParams, config: ConfigParams) => {
    const from = config.from;
    const inputData = {
      [from]: input[from],
    };
    const validationSchema = z.record(z.string(), z.string().or(z.number()));

    return validate(validationSchema, inputData);
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams) => {
    const keepExisting = config['keep-existing'] === true;
    const from = config['from'];
    const to = config['to'];

    return inputs.map(input => {
      const outputValue = !isNaN(from) ? from : input[from];

      if (input[from] || (!isNaN(from) && !keepExisting)) {
        delete input[config['pure-from']];
      }

      return {
        ...input,
        [to]: outputValue,
      };
    });
  },
  allowArithmeticExpressions: ['from'],
});
