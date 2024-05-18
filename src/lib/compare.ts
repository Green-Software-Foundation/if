import {oneIsPrimitive} from '../util/helpers';

import {Difference} from '../types/lib/compare';

/**
 * Returns `status` and `exception` properties from execution context.
 */
const omitExecutionParams = (object: any) => ({
  status: object.status,
  ...(object.error && {
    error: object.error,
  }),
});

/**
 * 1. If objects are not of the same type or are primitive types, compares directly.
 * 2. Gets the keys from both objects.
 * 3. If both are arrays, checks their elements.
 * 4. Checks for keys present in both objects.
 *    If key is `execution`, omit unnecessary params.
 * 5. If all keys are checked and no differences are found, return empty object.
 */
export const compare = (source: any, target: any, path = ''): Difference => {
  if (oneIsPrimitive(source, target)) {
    return source !== target
      ? {
          path,
          source,
          target,
        }
      : {};
  }

  const keys1 = Object.keys(source);
  const keys2 = Object.keys(target);

  const allKeys = new Set([...keys1, ...keys2]);

  if (Array.isArray(source) && Array.isArray(target)) {
    if (source.length !== target.length) {
      return {path, source, target};
    }

    for (let i = 0; i < source.length; i++) {
      return compare(source[i], target[i], path ? `${path}[${i}]` : `${i}`);
    }
  }

  for (const key of allKeys) {
    let result: any = {};

    if (key === 'execution') {
      if (source[key] && target[key]) {
        result = compare(
          omitExecutionParams(source[key]),
          omitExecutionParams(target[key]),
          path ? `${path}.${key}` : key
        );
      }
    } else {
      result = compare(source[key], target[key], path ? `${path}.${key}` : key);
    }

    if (Object.keys(result).length) {
      return result;
    }
  }

  return {};
};
