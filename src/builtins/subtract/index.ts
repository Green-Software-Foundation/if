import {z} from 'zod';
import {
  ExecutePlugin,
  PluginParams,
  SubtractConfig,
} from '@grnsft/if-core/types';

import {validate} from '../../util/validations';

export const Subtract = (globalConfig: SubtractConfig): ExecutePlugin => {
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
   * Subtract items from inputParams[1..n] from inputParams[0] and write the result in a new param outputParam.
   */
  const execute = (inputs: PluginParams[]): PluginParams[] => {
    const {
      'input-parameters': inputParameters,
      'output-parameter': outputParameter,
    } = validateGlobalConfig();

    return inputs.map(input => {
      validateSingleInput(input, inputParameters);

      return {
        ...input,
        [outputParameter]: calculateDiff(input, inputParameters),
      };
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
