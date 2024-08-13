import {ERRORS} from '@grnsft/if-core/utils';
import {RandIntGeneratorParams, ConfigParams} from '@grnsft/if-core/types';

import {STRINGS} from '../../../config';

import {Generator} from '../interfaces';

const {ConfigError} = ERRORS;

const {MISSING_CONFIG, MISSING_MIN_MAX, INVALID_MIN_MAX, INVALID_NAME} =
  STRINGS;

export const RandIntGenerator = (
  name: string,
  config: ConfigParams
): Generator => {
  const next = () => ({
    [validatedName]: generateRandInt(getFieldToPopulate()),
  });

  const validateName = (name: string | null): string => {
    if (!name || name.trim() === '') {
      throw new ConfigError(INVALID_NAME);
    }

    return name;
  };

  const validateConfig = (config: ConfigParams): {min: number; max: number} => {
    if (!config || Object.keys(config).length === 0) {
      throw new ConfigError(MISSING_CONFIG);
    }

    if (!config.min || !config.max) {
      throw new ConfigError(MISSING_MIN_MAX);
    }

    if (config.min >= config.max) {
      throw new ConfigError(INVALID_MIN_MAX(validatedName));
    }

    return {min: config.min, max: config.max};
  };

  const validatedName = validateName(name);
  const validatedConfig = validateConfig(config);

  const getFieldToPopulate = () => ({
    name: validatedName,
    min: validatedConfig.min,
    max: validatedConfig.max,
  });

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
