import {KeyValuePair} from '../../../types/common';
import {ERRORS} from '../../../util/errors';
import {buildErrorMessage} from '../../../util/helpers';

import {Generator} from '../interfaces';

const {InputValidationError} = ERRORS;

export const CommonGenerator = (config: KeyValuePair): Generator => {
  const errorBuilder = buildErrorMessage(CommonGenerator.name);

  /**
   * Creates new copy of the given `object`.
   */
  const copyObject = <T>(object: T): T => ({...object});

  /**
   * Validates the provided config is not null or empty.
   * returns a copy of the validated config, otherwise throws an InputValidationError.
   */
  const validateConfig = (config: object) => {
    if (!config || Object.keys(config).length === 0) {
      throw new InputValidationError(
        errorBuilder({message: 'Config must not be null or empty'})
      );
    }

    return copyObject(config);
  };

  /**
   * Generates next value by copying the validated config.
   */
  const next = (_historical: Object[] | undefined): Object =>
    copyObject(validateConfig(config));

  return {
    next,
  };
};
