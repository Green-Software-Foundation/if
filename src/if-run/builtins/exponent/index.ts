import {z, ZodType} from 'zod';
import {
  mapConfigIfNeeded,
  mapOutputIfNeeded,
} from '@grnsft/if-core/utils/helpers';
import {
  ERRORS,
  evaluateInput,
  evaluateConfig,
  evaluateArithmeticOutput,
  getParameterFromArithmeticExpression,
  validateArithmeticExpression,
} from '@grnsft/if-core/utils';
import {
  ExecutePlugin,
  PluginParams,
  ExponentConfig,
  PluginParametersMetadata,
  MappingParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

export const Exponent = (
  config: ExponentConfig,
  parametersMetadata: PluginParametersMetadata,
  mapping: MappingParams
): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs,
    outputs: parametersMetadata?.outputs,
  };

  /**
   * Checks config value are valid.
   */
  const validateConfig = () => {
    if (!config) {
      throw new ConfigError(MISSING_CONFIG);
    }

    const mappedConfig = mapConfigIfNeeded(config, mapping);
    const configSchema = z
      .object({
        'input-parameter': z.string().min(1),
        exponent: z.preprocess(
          value => validateArithmeticExpression('exponent', value),
          z.number()
        ),
        'output-parameter': z.string().min(1),
      })
      .refine(params => {
        Object.entries(params).forEach(([param, value]) =>
          validateArithmeticExpression(param, value)
        );

        return true;
      });

    return validate<z.infer<typeof configSchema>>(
      configSchema as ZodType<any>,
      mappedConfig
    );
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (
    input: PluginParams,
    configInputParameter: string | number
  ) => {
    const inputParameter =
      typeof configInputParameter === 'number'
        ? configInputParameter
        : getParameterFromArithmeticExpression(configInputParameter);
    const evaluatedInput = evaluateInput(input);

    const inputData = {
      [inputParameter]:
        typeof inputParameter === 'number'
          ? inputParameter
          : evaluatedInput[inputParameter],
    };
    const validationSchema = z.record(z.string(), z.number());

    return validate(validationSchema, inputData);
  };

  /**
   * Calculate the input param raised by to the power of the given exponent.
   */
  const execute = (inputs: PluginParams[]): PluginParams[] => {
    const safeConfig = validateConfig();
    const {
      'input-parameter': inputParameter,
      exponent,
      'output-parameter': outputParameter,
    } = safeConfig;

    return inputs.map(input => {
      const safeInput = validateSingleInput(input, inputParameter);
      const evaluatedConfig = evaluateConfig({
        config: safeConfig,
        input,
        parametersToEvaluate: ['input-parameter', 'exponent'],
      });

      const calculatedResult = calculateExponent(
        safeInput,
        evaluatedConfig['input-parameter'] || inputParameter,
        evaluatedConfig.exponent || exponent
      );

      const result = {
        ...input,
        ...safeInput,
        ...evaluateArithmeticOutput(outputParameter, calculatedResult),
      };

      return mapOutputIfNeeded(result, mapping);
    });
  };

  /**
   * Calculates the input param raised by the power of a given exponent.
   */
  const calculateExponent = (
    input: PluginParams,
    inputParameter: string | number,
    exponent: number
  ) => {
    const base =
      typeof inputParameter === 'number'
        ? inputParameter
        : input[inputParameter];

    return Math.pow(base, exponent);
  };

  return {
    metadata,
    execute,
  };
};
