import {z} from 'zod';

import {PluginParams, ConfigParams} from '@grnsft/if-core/types';
import {PluginFactory} from '@grnsft/if-core/interfaces';

import {validate} from '../../../common/util/validations';

import {TIME_UNITS_IN_SECONDS} from './config';

export const TimeConverter = PluginFactory({
  metadata: {
    inputs: {},
    outputs: {},
  },
  configValidation: (config: ConfigParams) => {
    const timeUnitsValues = Object.keys(TIME_UNITS_IN_SECONDS);
    const originalTimeUnitValuesWithDuration = [
      'duration',
      ...timeUnitsValues,
    ] as const;
    const originalTimeUnitValues = timeUnitsValues as [string, ...string[]];

    const configSchema = z.object({
      'input-parameter': z.string(),
      'original-time-unit': z.enum(originalTimeUnitValues),
      'new-time-unit': z.enum(originalTimeUnitValuesWithDuration),
      'output-parameter': z.string().min(1),
    });

    return validate<z.infer<typeof configSchema>>(configSchema, config);
  },
  inputValidation: async (input: PluginParams, config: ConfigParams = {}) => {
    const inputParameter = config['input-parameter'];

    const schema = z.object({
      duration: z.number().gte(1),
      [inputParameter]: z.number(),
    });

    return validate<z.infer<typeof schema>>(schema, input);
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams) => {
    const outputParameter = config['output-parameter'];

    return inputs.map(input => ({
      ...input,
      [outputParameter]: calculateEnergy(input, config),
    }));
  },
  allowArithmeticExpressions: ['input-parameter'],
});

/**
 * Calculates the energy for given period.
 */
const calculateEnergy = (input: PluginParams, config: ConfigParams) => {
  const {
    'original-time-unit': originalTimeUnit,
    'input-parameter': inputParameter,
    'new-time-unit': newTimeUnit,
  } = config;

  const originalTimeUnitInSeoncds = TIME_UNITS_IN_SECONDS[originalTimeUnit];
  const energyPerPeriod = isNaN(Number(inputParameter))
    ? input[inputParameter]
    : inputParameter;
  const timeUnit =
    newTimeUnit === 'duration'
      ? input.duration
      : TIME_UNITS_IN_SECONDS[newTimeUnit];

  const result = (energyPerPeriod / originalTimeUnitInSeoncds) * timeUnit;

  return Number(result.toFixed(6));
};
