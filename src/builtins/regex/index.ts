import {z} from 'zod';

import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';
import {validate} from '../../util/validations';

import {ExecutePlugin, PluginParams} from '../../types/interface';
import {ConfigParams} from '../../types/common';

const {InputValidationError, ConfigValidationError} = ERRORS;

export const Regex = (globalConfig: ConfigParams): ExecutePlugin => {
  const errorBuilder = buildErrorMessage(Regex.name);
  const metadata = {
    kind: 'execute',
  };

  /**
   * Checks global config value are valid.
   */
  const validateGlobalConfig = () => {
    if (!globalConfig) {
      throw new ConfigValidationError(
        errorBuilder({message: 'Configuration data is missing'})
      );
    }
    const schema = z.object({
      parameter: z.string().min(1),
      match: z.string().min(1),
      output: z.string(),
    });

    return validate<z.infer<typeof schema>>(schema, globalConfig);
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (input: PluginParams, parameter: string) => {
    if (!input[parameter]) {
      throw new InputValidationError(
        errorBuilder({
          message: `\`${parameter}\` is missing from the input`,
        })
      );
    }

    return input;
  };

  /**
   * Executes the regex of the given parameter.
   */
  const execute = (inputs: PluginParams[]) => {
    const safeGlobalConfig = validateGlobalConfig();
    const {parameter: parameter, match, output} = safeGlobalConfig;

    return inputs.map(input => {
      const safeInput = Object.assign(
        {},
        input,
        validateSingleInput(input, parameter)
      );

      return {
        ...input,
        [output]: extractMatching(safeInput, parameter, match),
      };
    });
  };

  /**
   * Extracts a substring from the given input parameter that matches the provided regular expression pattern.
   */
  const extractMatching = (
    input: PluginParams,
    parameter: string,
    match: string
  ) => {
    if (!match.startsWith('/')) {
      match = '/' + match;
    }

    if (!match.endsWith('/g') && !match.endsWith('/')) {
      match += '/';
    }

    const regex = eval(match);
    const matchedItem = input[parameter].match(regex);

    if (!matchedItem || !matchedItem[0]) {
      throw new InputValidationError(
        errorBuilder({
          message: `\`${input[parameter]}\` does not match the ${match} regex expression`,
        })
      );
    }

    return matchedItem[0];
  };

  return {
    metadata,
    execute,
  };
};
