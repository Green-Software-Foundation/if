import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {
  ExecutePlugin,
  PluginParams,
  PluginParametersMetadata,
  ConfigParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

import {TIME_UNITS_IN_SECONDS} from './config';

const {GlobalConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

export const TimeConverter = (
  config: ConfigParams,
  parametersMetadata: PluginParametersMetadata
): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs,
    outputs: parametersMetadata?.outputs,
  };

  const execute = (inputs: PluginParams[]) => {
    const safeGlobalConfig = validateConfig();
    const inputParameter = safeGlobalConfig['input-parameter'];
    const outputParameter = safeGlobalConfig['output-parameter'];

    return inputs.map(input => {
      validateInput(input, inputParameter);

      return {
        ...input,
        [outputParameter]: calculateEnergy(input),
      };
    });
  };

  /**
   * Calculates the energy for given period.
   */
  const calculateEnergy = (input: PluginParams) => {
    const originalTimeUnit = config['original-time-unit'];
    const originalTimeUnitInSeoncds = TIME_UNITS_IN_SECONDS[originalTimeUnit];
    const energyPerPeriod = input[config['input-parameter']];
    const newTimeUnit =
      config['new-time-unit'] === 'duration'
        ? input.duration
        : TIME_UNITS_IN_SECONDS[config['new-time-unit']];
    const result = (energyPerPeriod / originalTimeUnitInSeoncds) * newTimeUnit;

    return Number(result.toFixed(6));
  };

  /**
   * Checks for required fields in input.
   */
  const validateInput = (input: PluginParams, inputParameter: string) => {
    const schema = z.object({
      duration: z.number().gte(1),
      [inputParameter]: z.number(),
    });

    return validate<z.infer<typeof schema>>(schema, input);
  };

  /**
   * Checks config value are valid.
   */
  const validateConfig = () => {
    if (!config) {
      throw new GlobalConfigError(MISSING_CONFIG);
    }

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
  };
  return {
    metadata,
    execute,
  };
};
