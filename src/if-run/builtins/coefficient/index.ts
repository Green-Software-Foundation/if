import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {
  CoefficientConfig,
  ExecutePlugin,
  MappingParams,
  PluginParametersMetadata,
  PluginParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';
import {mapConfigIfNeeded} from '../../../common/util/helpers';

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
    const safeGlobalConfig = validateConfig();
    const inputParameter = safeGlobalConfig['input-parameter'];
    const outputParameter = safeGlobalConfig['output-parameter'];
    const coefficient = safeGlobalConfig['coefficient'];

    return inputs.map(input => {
      validateSingleInput(input, inputParameter);

      return {
        ...input,
        [outputParameter]: calculateProduct(input, inputParameter, coefficient),
      };
    });
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (input: PluginParams, inputParameter: string) => {
    const inputData = {
      'input-parameter': input[inputParameter],
    };
    const validationSchema = z.record(z.string(), z.number());
    validate(validationSchema, inputData);

    return input;
  };

  /**
   * Calculates the product of the energy components.
   */
  const calculateProduct = (
    input: PluginParams,
    inputParameter: string,
    coefficient: number
  ) => input[inputParameter] * coefficient;

  /**
   * Checks config value are valid.
   */
  const validateConfig = () => {
    if (!config) {
      throw new ConfigError(MISSING_CONFIG);
    }

    const mappedConfig = mapConfigIfNeeded(config, mapping);

    const configSchema = z.object({
      coefficient: z.number(),
      'input-parameter': z.string().min(1),
      'output-parameter': z.string().min(1),
    });

    return validate<z.infer<typeof configSchema>>(configSchema, mappedConfig);
  };

  return {
    metadata,
    execute,
  };
};
