import {ERRORS} from '../../../util/errors';

import {STRINGS} from '../../../config';

import {Generator} from '../interfaces';

const {GlobalConfigError} = ERRORS;
const {MISSING_GLOBAL_CONFIG} = STRINGS;

export const CommonGenerator = (config: Record<string, any>): Generator => {
  /**
   * Generates next value by copying the validated config.
   * Validates the provided config is not null or empty.
   * Returns a copy of the validated config, otherwise throws an GlobalConfigError.
   */
  const validateConfig = (config: object) => {
    if (!config || Object.keys(config).length === 0) {
      throw new GlobalConfigError(MISSING_GLOBAL_CONFIG);
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
