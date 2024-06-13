import {z} from 'zod';

import {validate} from '../../util/validations';
import {ERRORS} from '../../util/errors';

import {STRINGS} from '../../config';

import {ExecutePlugin, PluginParams} from '../../types/interface';
import {SumConfig} from './types';

const {GlobalConfigError, MissingInputDataError} = ERRORS;
const {MISSING_INPUT_DATA, MISSING_GLOBAL_CONFIG} = STRINGS;

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
      const safeInput = validateSingleInput(input, inputParameters);

      return {
        ...input,
        [outputParameter]: calculateSum(safeInput, inputParameters),
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
    inputParameters.forEach(metricToSum => {
      if (!input[metricToSum]) {
        throw new MissingInputDataError(MISSING_INPUT_DATA(metricToSum));
      }
    });

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
