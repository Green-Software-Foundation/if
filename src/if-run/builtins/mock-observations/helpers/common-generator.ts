import {ERRORS} from '@grnsft/if-core/utils';
import {ConfigParams} from '@grnsft/if-core/types';

import {STRINGS} from '../../../config';

import {Generator} from '../interfaces';

const {ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

export const CommonGenerator = (config: ConfigParams): Generator => {
  /**
   * Generates next value by copying the validated config.
   * Validates the provided config is not null or empty.
   * Returns a copy of the validated config, otherwise throws an ConfigError.
   */
  const validateConfig = (config: object) => {
    if (!config || Object.keys(config).length === 0) {
      throw new ConfigError(MISSING_CONFIG);
    }

    return structuredClone(config);
  };

  /**
   * Generates next value by copying the validated config.
   */
  const next = (): Object => validateConfig(config);

  return {
    next,
  };
};
