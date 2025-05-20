import {z} from 'zod';

import {PluginFactory} from '@grnsft/if-core/interfaces';
import {ConfigParams, PluginParams} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {ERRORS} from '@grnsft/if-core/utils';

import {allDefined} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {MissingInputDataError, ConfigError} = ERRORS;
const {
  MISSING_FUNCTIONAL_UNIT_CONFIG,
  MISSING_FUNCTIONAL_UNIT_INPUT,
  SCI_MISSING_FN_UNIT,
  ZERO_DIVISION,
  MISSING_CONFIG,
} = STRINGS;

export const Sci = PluginFactory({
  metadata: {
    inputs: {
      carbon: {
        description: 'an amount of carbon emitted into the atmosphere',
        unit: 'gCO2e',
        'aggregation-method': {
          time: 'sum',
          component: 'sum',
        },
      },
      'functional-unit': {
        description:
          'the name of the functional unit in which the final SCI value should be expressed, e.g. requests, users',
        unit: 'none',
        'aggregation-method': {
          time: 'sum',
          component: 'sum',
        },
      },
    },
    outputs: {
      sci: {
        description: 'carbon expressed in terms of the given functional unit',
        unit: 'gCO2e',
        'aggregation-method': {
          time: 'avg',
          component: 'sum',
        },
      },
    },
  },
  configValidation: (config: ConfigParams) => {
    if (!config || !Object.keys(config)?.length) {
      throw new ConfigError(MISSING_CONFIG);
    }

    const schema = z
      .object({
        'functional-unit': z.string(),
      })
      .refine(data => data['functional-unit'], {
        message: MISSING_FUNCTIONAL_UNIT_CONFIG,
      });

    return validate<z.infer<typeof schema>>(schema, config);
  },
  inputValidation: (input: PluginParams, config: ConfigParams) => {
    const functionalUnit = config['functional-unit'];

    if (!(functionalUnit in input && input[functionalUnit] >= 0)) {
      throw new MissingInputDataError(MISSING_FUNCTIONAL_UNIT_INPUT);
    }

    const schema = z
      .object({
        carbon: z.number().gte(0),
        duration: z.number().gte(1),
      })
      .refine(allDefined, {
        message: SCI_MISSING_FN_UNIT(config['functional-unit']),
      });

    return validate<z.infer<typeof schema>>(schema, input);
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams) => {
    return inputs.map((input, index) => {
      const functionalUnit = isNaN(config['functional-unit'])
        ? input[config['functional-unit']]
        : config['functional-unit'];

      if (functionalUnit === 0) {
        console.warn(ZERO_DIVISION('Sci', index));

        return {
          ...input,
          sci: input['carbon'],
        };
      }
      const calculatedResult = input['carbon'] / functionalUnit;

      return {
        ...input,
        sci: calculatedResult,
      };
    });
  },
  allowArithmeticExpressions: ['functional-unit'],
});
