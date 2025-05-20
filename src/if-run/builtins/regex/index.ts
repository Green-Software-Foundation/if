import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';

import {ConfigParams, PluginParams} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';
import {PluginFactory} from '@grnsft/if-core/interfaces';

const {MissingInputDataError, ConfigError, RegexMismatchError} = ERRORS;
const {MISSING_CONFIG, MISSING_INPUT_DATA, REGEX_MISMATCH} = STRINGS;

export const Regex = PluginFactory({
  configValidation: (config: ConfigParams) => {
    if (!config || !Object.keys(config)?.length) {
      throw new ConfigError(MISSING_CONFIG);
    }

    const schema = z.object({
      parameter: z.string().min(1),
      match: z.string().min(1),
      output: z.string(),
    });

    return validate<z.infer<typeof schema>>(schema, config);
  },
  inputValidation: (input: PluginParams, config: ConfigParams) => {
    const parameter = config['parameter'];

    if (!input[parameter]) {
      throw new MissingInputDataError(MISSING_INPUT_DATA(parameter));
    }

    return input;
  },
  implementation: async (inputs, config) => {
    const {parameter: parameter, match, output} = config;

    return inputs.map(input => ({
      ...input,
      [output]: extractMatching(input, parameter, match),
    }));
  },
});

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
