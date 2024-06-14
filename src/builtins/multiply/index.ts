import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {
  ExecutePlugin,
  PluginParams,
  MultiplyConfig,
} from '@grnsft/if-core/types';

import {validate} from '../../util/validations';

import {STRINGS} from '../../config';

const {MissingInputDataError} = ERRORS;
const {MISSING_INPUT_DATA} = STRINGS;

export const Multiply = (globalConfig: MultiplyConfig): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
  };

  /**
   * Checks global config value are valid.
   */
  const validateGlobalConfig = () => {
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
    inputParameters.forEach(metricToMultiply => {
      if (
        input[metricToMultiply] === undefined ||
        isNaN(input[metricToMultiply])
      ) {
        throw new MissingInputDataError(MISSING_INPUT_DATA(metricToMultiply));
      }
    });

    return input;
  };

  /**
   * Calculate the product of each input parameter.
   */
  const execute = (inputs: PluginParams[]): PluginParams[] => {
    const safeGlobalConfig = validateGlobalConfig();
    const inputParameters = safeGlobalConfig['input-parameters'];
    const outputParameter = safeGlobalConfig['output-parameter'];

    return inputs.map(input => {
      const safeInput = validateSingleInput(input, inputParameters);

      return {
        ...input,
        [outputParameter]: calculateProduct(safeInput, inputParameters),
      };
    });
  };

  /**
   * Calculates the product of the energy components.
   */
  const calculateProduct = (input: PluginParams, inputParameters: string[]) =>
    inputParameters.reduce(
      (accumulator, metricToMultiply) => accumulator * input[metricToMultiply],
      1
    );

  return {
    metadata,
    execute,
  };
};
