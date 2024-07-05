import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {ExecutePlugin, PluginParams, SumConfig} from '@grnsft/if-core/types';

import {validate} from '../../util/validations';

import {STRINGS} from '../../config';

const {GlobalConfigError} = ERRORS;
const {MISSING_GLOBAL_CONFIG} = STRINGS;

export const Sum = (globalConfig: SumConfig): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
  };

  /**
   * Calculate the sum of each input-paramters.
   */
  const execute = (inputs: PluginParams[]) => {
    const safeGlobalConfig = validateGlobalConfig();
    const inputParameters = safeGlobalConfig['input-parameters'];
    const outputParameter = safeGlobalConfig['output-parameter'];

    return inputs.map(input => {
      validateSingleInput(input, inputParameters);

      return {
        ...input,
        [outputParameter]: calculateSum(input, inputParameters),
      };
    });
  };

  /**
   * Checks global config value are valid.
   */
  const validateGlobalConfig = () => {
    if (!globalConfig) {
      throw new GlobalConfigError(MISSING_GLOBAL_CONFIG);
    }

    const globalConfigSchema = z.object({
      'input-parameters': z.array(z.string()),
      'output-parameter': z.string().min(1),
    });

    return validate<z.infer<typeof globalConfigSchema>>(
      globalConfigSchema,
      globalConfig
    );
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (
    input: PluginParams,
    inputParameters: string[]
  ) => {
    const inputData = inputParameters.reduce(
      (acc, param) => {
        acc[param] = input[param];

        return acc;
      },
      {} as Record<string, number>
    );
    const validationSchema = z.record(z.string(), z.number());
    validate(validationSchema, inputData);

    return input;
  };

  /**
   * Calculates the sum of the energy components.
   */
  const calculateSum = (input: PluginParams, inputParameters: string[]) =>
    inputParameters.reduce(
      (accumulator, metricToSum) => accumulator + input[metricToSum],
      0
    );

  return {
    metadata,
    execute,
  };
};
