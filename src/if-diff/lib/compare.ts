import {checkIfEqual, oneIsPrimitive} from '../util/helpers';

import {Difference} from '../types/compare';

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
    return checkIfEqual(source, target)
      ? {}
      : {
          path,
          source,
          target,
        };
  }

  const keys1 = Object.keys(source);
  const keys2 = Object.keys(target);

  const allKeys = new Set([...keys1, ...keys2]);

  if (path === '') {
    allKeys.delete('name');
    allKeys.delete('description');
    allKeys.delete('tags');
  }

  if (path === 'initialize') {
    allKeys.delete('outputs');
  }

  if (path === 'execution') {
    const whitelist = ['status', 'error'];
    allKeys.forEach(value => {
      if (!whitelist.includes(value)) {
        allKeys.delete(value);
      }
    });
  }

  if (Array.isArray(source) && Array.isArray(target)) {
    source.forEach((_record, i) => {
      compare(source[i], target[i], path ? `${path}[${i}]` : `${i}`);
    });
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
