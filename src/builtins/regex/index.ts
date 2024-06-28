import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {ExecutePlugin, PluginParams, ConfigParams} from '@grnsft/if-core/types';

import {validate} from '../../util/validations';

import {STRINGS} from '../../config';

const {MissingInputDataError, GlobalConfigError, RegexMismatchError} = ERRORS;
const {MISSING_GLOBAL_CONFIG, MISSING_INPUT_DATA, REGEX_MISMATCH} = STRINGS;

export const Regex = (globalConfig: ConfigParams): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
  };

  /**
   * Checks global config value are valid.
   */
  const validateGlobalConfig = () => {
    if (!globalConfig) {
      throw new GlobalConfigError(MISSING_GLOBAL_CONFIG);
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
      throw new MissingInputDataError(MISSING_INPUT_DATA(parameter));
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
      throw new RegexMismatchError(REGEX_MISMATCH(input[parameter], match));
    }

    return matchedItem[0];
  };

  return {
    metadata,
    execute,
  };
};
