import {z} from 'zod';
import {
  ERRORS,
  evaluateInput,
  evaluateConfig,
  evaluateArithmeticOutput,
  validateArithmeticExpression,
  getParameterFromArithmeticExpression,
} from '@grnsft/if-core/utils';
import {
  mapConfigIfNeeded,
  mapOutputIfNeeded,
} from '@grnsft/if-core/utils/helpers';
import {
  ExecutePlugin,
  PluginParams,
  PluginParametersMetadata,
  ConfigParams,
  MappingParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

import {TIME_UNITS_IN_SECONDS} from './config';

const {ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

export const TimeConverter = (
  config: ConfigParams,
  parametersMetadata: PluginParametersMetadata,
  mapping: MappingParams
): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs,
    outputs: parametersMetadata?.outputs,
  };

  const execute = (inputs: PluginParams[]) => {
    const safeConfig = validateConfig();
    const {
      'input-parameter': inputParameter,
      'output-parameter': outputParameter,
    } = safeConfig;

    return inputs.map(input => {
      const safeInput = Object.assign(
        {},
        input,
        validateInput(input, inputParameter)
      );
      const calculatedConfig = evaluateConfig({
        config: safeConfig,
        input: safeInput,
        parametersToEvaluate: ['input-parameter'],
      });

      const result = {
        ...input,
        ...safeInput,
        ...evaluateArithmeticOutput(
          outputParameter,
          calculateEnergy(safeInput, calculatedConfig['input-parameter'])
        ),
      };

      return mapOutputIfNeeded(result, mapping);
    });
  };

  /**
   * Calculates the energy for given period.
   */
  const calculateEnergy = (
    input: PluginParams,
    inputParameter: string | number
  ) => {
    const originalTimeUnit = config['original-time-unit'];
    const originalTimeUnitInSeoncds = TIME_UNITS_IN_SECONDS[originalTimeUnit];
    const energyPerPeriod = isNaN(Number(inputParameter))
      ? input[inputParameter]
      : inputParameter;
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
  const validateInput = (input: PluginParams, configInputParameter: string) => {
    const inputParameter =
      getParameterFromArithmeticExpression(configInputParameter);

    const schema = z.object({
      duration: z.number().gte(1),
      [inputParameter]: z.number(),
    });

    const evaluatedInput = evaluateInput(input);
    return validate<z.infer<typeof schema>>(schema, evaluatedInput);
  };

  /**
   * Checks config value are valid.
   */
  const validateConfig = () => {
    if (!config) {
      throw new ConfigError(MISSING_CONFIG);
    }

    config = mapConfigIfNeeded(config, mapping);
    const timeUnitsValues = Object.keys(TIME_UNITS_IN_SECONDS);
    const originalTimeUnitValuesWithDuration = [
      'duration',
      ...timeUnitsValues,
    ] as const;
    const originalTimeUnitValues = timeUnitsValues as [string, ...string[]];

    const configSchema = z
      .object({
        'input-parameter': z.string(),
        'original-time-unit': z.enum(originalTimeUnitValues),
        'new-time-unit': z.enum(originalTimeUnitValuesWithDuration),
        'output-parameter': z.string().min(1),
      })
      .refine(params => {
        Object.entries(params).forEach(([param, value]) =>
          validateArithmeticExpression(param, value)
        );

        return true;
      });

    return validate<z.infer<typeof configSchema>>(configSchema, config);
  };
  return {
    metadata,
    execute,
  };
};
