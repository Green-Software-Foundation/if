import {checkIfEqual, oneIsPrimitive} from '../util/helpers';

import {Difference} from '../types/lib/compare';

/**
 * 1. If objects are not of the same type or are primitive types, compares directly.
 * 2. Gets the keys from both objects.
 * 3. Checks for keys present in both objects.
 * 4. If both are arrays, checks their elements.
 * 5. Checks for differences in values for common keys.
 * 6. If all common keys are checked and no differences are found, return empty object.
 */
export const compare = (source: any, target: any, path = ''): Difference => {
  if (oneIsPrimitive(source, target)) {
    return checkIfEqual(source, target)
      ? {}
      : {
          path,
          source: source,
          target: target,
        };
  }

  const keys1 = Object.keys(source);
  const keys2 = Object.keys(target);

  const allKeys = new Set([...keys1, ...keys2]);

  if (Array.isArray(source) && Array.isArray(target)) {
    for (let i = 0; i < source.length; i++) {
      compare(source[i], target[i], path ? `${path}[${i}]` : `${i}`);
    }
  }

  for (const key of allKeys) {
    const result = compare(
      source[key],
      target[key],
      path ? `${path}.${key}` : key
    );

    if (Object.keys(result).length) {
      return result;
    }
  }

  return {};
};
