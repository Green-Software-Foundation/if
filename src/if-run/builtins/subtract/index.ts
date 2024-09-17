import {z} from 'zod';
import {
  ERRORS,
  evaluateInput,
  evaluateConfig,
  evaluateArithmeticOutput,
  validateArithmeticExpression,
} from '@grnsft/if-core/utils';
import {
  mapConfigIfNeeded,
  mapOutputIfNeeded,
} from '@grnsft/if-core/utils/helpers';
import {
  ExecutePlugin,
  MappingParams,
  PluginParametersMetadata,
  PluginParams,
  SubtractConfig,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

export const Subtract = (
  config: SubtractConfig,
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

    const configSchema = z.object({
      'input-parameters': z.array(z.string()),
      'output-parameter': z
        .string()
        .min(1)
        .refine(value =>
          validateArithmeticExpression('output-parameter', value)
        ),
    });

    return validate<z.infer<typeof configSchema>>(configSchema, mappedConfig);
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (
    input: PluginParams,
    inputParameters: string[]
  ) => {
    const evaluatedInput = evaluateInput(input);

    const inputData = inputParameters.reduce(
      (acc, param) => {
        acc[param] = evaluatedInput[param];

        return acc;
      },
      {} as Record<string, number>
    );

    const validationSchema = z.record(z.string(), z.number());

    return validate(validationSchema, inputData);
  };

  /**
   * Subtract items from inputParams[1..n] from inputParams[0] and write the result in a new param outputParam.
   */
  const execute = (inputs: PluginParams[]): PluginParams[] => {
    const safeConfig = validateConfig();
    const {
      'input-parameters': inputParameters,
      'output-parameter': outputParameter,
    } = safeConfig;

    return inputs.map(input => {
      const calculatedConfig = evaluateConfig({
        config: safeConfig,
        input,
        parametersToEvaluate: safeConfig['input-parameters'],
      });
      const safeInput = Object.assign(
        {},
        input,
        validateSingleInput(input, inputParameters)
      );
      const calculatedResult = calculateDiff(
        safeInput,
        calculatedConfig['input-parameters'] || inputParameters
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
   * Calculates the diff between the 1st item in the inputs nad the rest of the items
   */
  const calculateDiff = (input: PluginParams, inputParameters: string[]) => {
    const [firstItem, ...restItems] = inputParameters;

    return restItems.reduce(
      (accumulator, metricToSubtract) => accumulator - input[metricToSubtract],
      input[firstItem] // Starting accumulator with the value of the first item
    );
  };

  return {
    metadata,
    execute,
  };
};
