import {KeyValuePair} from '../../../types/common';
import {ERRORS} from '../../../util/errors';
import {buildErrorMessage} from '../../../util/helpers';

import {Generator} from '../interfaces';
import {RandIntGeneratorParams} from '../types';

const {InputValidationError} = ERRORS;

export const RandIntGenerator = (
  name: string,
  config: KeyValuePair
): Generator => {
  const errorBuilder = buildErrorMessage(RandIntGenerator.name);

  const next = () => ({
    [validatedName]: generateRandInt(getFieldToPopulate()),
  });

  const validateName = (name: string | null): string => {
    if (!name || name.trim() === '') {
      throw new InputValidationError(
        errorBuilder({
          message: '`name` is empty or all spaces',
        })
      );
    }
    return name;
  };

  const validateConfig = (config: KeyValuePair): {min: number; max: number} => {
    if (!config || Object.keys(config).length === 0) {
      throw new InputValidationError(
        errorBuilder({
          message: 'Config must not be null or empty',
        })
      );
    }

    if (!config.min || !config.max) {
      throw new InputValidationError(
        errorBuilder({
          message: 'Config is missing min or max',
        })
      );
    }

    if (config.min >= config.max) {
      throw new InputValidationError(
        errorBuilder({
          message: `Min value should not be greater than or equal to max value of ${validatedName}`,
        })
      );
    }
    return {min: config.min, max: config.max};
  };

  const validatedName = validateName(name);
  const validatedConfig = validateConfig(config);

  const getFieldToPopulate = () => {
    return {
      name: validatedName,
      min: validatedConfig.min,
      max: validatedConfig.max,
    };
  };

  const generateRandInt = (
    randIntGenerator: RandIntGeneratorParams
  ): number => {
    const randomNumber = Math.random();
    const scaledNumber =
      randomNumber * (randIntGenerator.max - randIntGenerator.min) +
      randIntGenerator.min;
    return Math.trunc(scaledNumber);
  };

  return {
    next,
  };
};
