import {z, ZodType} from 'zod';
import {
  ERRORS,
  evaluateInput,
  evaluateConfig,
  evaluateArithmeticOutput,
  getParameterFromArithmeticExpression,
  validateArithmeticExpression,
} from '@grnsft/if-core/utils';
import {
  mapConfigIfNeeded,
  mapOutputIfNeeded,
} from '@grnsft/if-core/utils/helpers';
import {
  CoefficientConfig,
  ExecutePlugin,
  MappingParams,
  PluginParametersMetadata,
  PluginParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

export const Coefficient = (
  config: CoefficientConfig,
  parametersMetadata: PluginParametersMetadata,
  mapping: MappingParams
): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs,
    outputs: parametersMetadata?.outputs,
  };

  /**
   * Calculate the product of each input parameter.
   */
  const execute = (inputs: PluginParams[]) => {
    const safeConfig = validateConfig();
    const {
      'input-parameter': inputParameter,
      'output-parameter': outputParameter,
    } = safeConfig;
    return inputs.map(input => {
      const calculatedConfig = evaluateConfig({
        config: safeConfig,
        input,
        parametersToEvaluate: ['input-parameter', 'coefficient'],
      });

      const safeInput = validateSingleInput(input, inputParameter);
      const coefficient = Number(calculatedConfig['coefficient']);
      const calculatedResult = calculateProduct(
        safeInput,
        calculatedConfig['input-parameter'],
        coefficient
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
   * Checks for required fields in input.
   */
  const validateSingleInput = (
    input: PluginParams,
    configInputParameter: string
  ) => {
    const inputParameter =
      getParameterFromArithmeticExpression(configInputParameter);
    const evaluatedInput = evaluateInput(input);

    const inputData = {
      [inputParameter]: evaluatedInput[inputParameter],
    };
    const validationSchema = z.record(z.string(), z.number());
    validate(validationSchema, inputData);

    return evaluatedInput;
  };

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
        coefficient: z.preprocess(
          value => validateArithmeticExpression('coefficient', value),
          z.number()
        ),
        'input-parameter': z.string().min(1),
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

  return {
    metadata,
    execute,
  };
};
