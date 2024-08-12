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
const {MISSING_GLOBAL_CONFIG} = STRINGS;

export const TimeConverter = (
  globalConfig: ConfigParams,
  parametersMetadata: PluginParametersMetadata
): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs,
    outputs: parametersMetadata?.outputs,
  };

  const execute = (inputs: PluginParams[]) => {
    const safeGlobalConfig = validateGlobalConfig();
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
    const originalTimeUnit = globalConfig['original-time-unit'];
    const originalTimeUnitInSeoncds = TIME_UNITS_IN_SECONDS[originalTimeUnit];
    const energyPerPeriod = input[globalConfig['input-parameter']];
    const newTimeUnit =
      globalConfig['new-time-unit'] === 'duration'
        ? input.duration
        : TIME_UNITS_IN_SECONDS[globalConfig['new-time-unit']];
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
   * Checks global config value are valid.
   */
  const validateGlobalConfig = () => {
    if (!globalConfig) {
      throw new GlobalConfigError(MISSING_GLOBAL_CONFIG);
    }

    const timeUnitsValues = Object.keys(TIME_UNITS_IN_SECONDS);
    const originalTimeUnitValuesWithDuration = [
      'duration',
      ...timeUnitsValues,
    ] as const;
    const originalTimeUnitValues = timeUnitsValues as [string, ...string[]];

    const globalConfigSchema = z.object({
      'input-parameter': z.string(),
      'original-time-unit': z.enum(originalTimeUnitValues),
      'new-time-unit': z.enum(originalTimeUnitValuesWithDuration),
      'output-parameter': z.string().min(1),
    });

    return validate<z.infer<typeof globalConfigSchema>>(
      globalConfigSchema,
      globalConfig
    );
  };
  return {
    metadata,
    execute,
  };
};
