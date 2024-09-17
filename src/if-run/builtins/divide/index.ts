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
  ConfigParams,
  PluginParametersMetadata,
  MappingParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {ConfigError, MissingInputDataError} = ERRORS;
const {MISSING_CONFIG, MISSING_INPUT_DATA, ZERO_DIVISION} = STRINGS;

export const Divide = (
  config: ConfigParams,
  parametersMetadata: PluginParametersMetadata,
  mapping: MappingParams
): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs,
    outputs: parametersMetadata?.outputs,
  };

  /**
   * Calculate the division of each input parameter.
   */
  const execute = (inputs: PluginParams[]) => {
    const safeConfig = validateConfig();
    const {numerator, denominator, output} = safeConfig;

    return inputs.map((input, index) => {
      const evaluatedConfig = evaluateConfig({
        config: safeConfig,
        input,
        parametersToEvaluate: ['numerator', 'denominator'],
      });
      const safeInput = validateSingleInput(input, safeConfig);
      const calculatedResult = calculateDivide(safeInput, index, {
        numerator: evaluatedConfig.numerator || numerator,
        denominator: evaluatedConfig.denominator || denominator,
      });

      const result = {
        ...input,
        ...safeInput,
        ...evaluateArithmeticOutput(output, calculatedResult),
      };

      return mapOutputIfNeeded(result, mapping);
    });
  };

  /**
   * Checks config value are valid.
   */
  const validateConfig = () => {
    if (!config) {
      throw new ConfigError(MISSING_CONFIG);
    }

    const mappedConfig = mapConfigIfNeeded(config, mapping);
    const schema = z
      .object({
        numerator: z.string().min(1),
        denominator: z.string().or(z.number()),
        output: z.string(),
      })
      .refine(params => {
        Object.entries(params).forEach(([param, value]) =>
          validateArithmeticExpression(param, value)
        );

        return true;
      });

    return validate<z.infer<typeof schema>>(schema, mappedConfig);
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (
    input: PluginParams,
    safeConfig: ConfigParams
  ) => {
    const numerator = getParameterFromArithmeticExpression(
      safeConfig.numerator
    );
    const denominator = getParameterFromArithmeticExpression(
      safeConfig.denominator
    );

    const schema = z
      .object({
        [numerator]: z.number(),
        [denominator]: z.number().optional(),
      })
      .refine(() => {
        if (typeof denominator === 'string' && !input[denominator]) {
          throw new MissingInputDataError(MISSING_INPUT_DATA(denominator));
        }

        return true;
      });

    const evaluatedInput = evaluateInput(input);
    return validate<z.infer<typeof schema>>(schema, evaluatedInput);
  };

  /**
   * Calculates the division of the given parameter.
   */
  const calculateDivide = (
    input: PluginParams,
    index: number,
    params: {
      numerator: number | string;
      denominator: number | string;
    }
  ) => {
    const {denominator, numerator} = params;
    const finalDenominator =
      typeof denominator === 'number'
        ? denominator
        : input[denominator] || denominator;
    const finalNumerator =
      typeof numerator === 'number' ? numerator : input[numerator];

    if (finalDenominator === 0) {
      console.warn(ZERO_DIVISION(Divide.name, index));
      return finalNumerator;
    }

    return finalNumerator / finalDenominator;
  };

  return {
    metadata,
    execute,
  };
};
