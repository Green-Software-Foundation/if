import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {
  ExecutePlugin,
  PluginParams,
  ConfigParams,
  PluginParametersMetadata,
  MappingParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';
import {mapConfigIfNeeded} from '../../../common/util/helpers';

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
    const safeGlobalConfig = validateConfig();
    const {numerator, denominator, output} = safeGlobalConfig;

    return inputs.map((input, index) => {
      const safeInput = Object.assign(
        {},
        input,
        validateSingleInput(input, {numerator, denominator})
      );

      return {
        ...input,
        [output]: calculateDivide(safeInput, index, {numerator, denominator}),
      };
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
    const schema = z.object({
      numerator: z.string().min(1),
      denominator: z.string().or(z.number()),
      output: z.string(),
    });

    return validate<z.infer<typeof schema>>(schema, mappedConfig);
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (
    input: PluginParams,
    params: {
      numerator: string;
      denominator: number | string;
    }
  ) => {
    const {numerator, denominator} = params;

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

    return validate<z.infer<typeof schema>>(schema, input);
  };

  /**
   * Calculates the division of the given parameter.
   */
  const calculateDivide = (
    input: PluginParams,
    index: number,
    params: {
      numerator: string;
      denominator: number | string;
    }
  ) => {
    const {denominator, numerator} = params;
    const finalDenominator = input[denominator] || denominator;

    if (finalDenominator === 0) {
      console.warn(ZERO_DIVISION(Divide.name, index));
      return input[numerator];
    }

    return input[numerator] / finalDenominator;
  };

  return {
    metadata,
    execute,
  };
};
