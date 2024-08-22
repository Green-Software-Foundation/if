import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {
  mapConfigIfNeeded,
  mapOutputIfNeeded,
} from '@grnsft/if-core/utils/helpers';
import {
  ExecutePlugin,
  PluginParams,
  ConfigParams,
  PluginParametersMetadata,
  MappingParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {MissingInputDataError, ConfigError, RegexMismatchError} = ERRORS;
const {MISSING_CONFIG, MISSING_INPUT_DATA, REGEX_MISMATCH} = STRINGS;

export const Regex = (
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
   * Checks config value are valid.
   */
  const validateConfig = () => {
    if (!config) {
      throw new ConfigError(MISSING_CONFIG);
    }

    const mappedConfig = mapConfigIfNeeded(config, mapping);

    const schema = z.object({
      parameter: z.string().min(1),
      match: z.string().min(1),
      output: z.string(),
    });

    return validate<z.infer<typeof schema>>(schema, mappedConfig);
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
    const safeGlobalConfig = validateConfig();
    const {parameter: parameter, match, output} = safeGlobalConfig;

    return inputs.map(input => {
      const safeInput = Object.assign(
        {},
        input,
        validateSingleInput(input, parameter)
      );

      const result = {
        ...input,
        [output]: extractMatching(safeInput, parameter, match),
      };

      return mapOutputIfNeeded(result, mapping);
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
    const matchedItems = input[parameter].match(regex);

    if (!matchedItems || matchedItems.length === 0) {
      throw new RegexMismatchError(REGEX_MISMATCH(input[parameter], match));
    }

    return matchedItems.join(' ');
  };

  return {
    metadata,
    execute,
  };
};
