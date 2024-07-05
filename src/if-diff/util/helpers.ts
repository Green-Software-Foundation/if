import {createInterface} from 'node:readline/promises';
import {Difference} from '../types/compare';

/**
 * `If-diff` equality checker.
 */
export const checkIfEqual = (source: any, target: any) => {
  if (source === target) {
    return true;
  }

  if (source === '*' || target === '*') {
    return true;
  }

  return false;
};

/**
 * Checks if objects are primitive types.
 */
export const oneIsPrimitive = (source: any, target: any) => {
  // eslint-disable-next-line eqeqeq
  if (source == null || target == null) {
    return true;
  }

  return source !== Object(source) && target !== Object(target);
};

/**
 * Converts given `value` to either `1` or `0`.
 */
const convertToXorable = (value: any) => {
  if (typeof value === 'number') {
    return value !== 0 ? 1 : 0;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (typeof value === 'string') {
    return value.length > 0 ? 1 : 0;
  }

  if (typeof value === 'object') {
    return 1;
  }

  return 0;
};

/**
 * If one of the `valuesToCheck` values is undefined, then set `missing`, otherwise `exists`.
 */
const setValuesIfMissing = (response: Difference) => {
  const source = convertToXorable(response.source);
  const target = convertToXorable(response.target);

  if (source ^ target) {
    ['source', 'target'].forEach(value => {
      response[value] = response[value] ? 'exists' : 'missing';
    });

    return response;
  }

  return response;
};

/**
 * Format not matching message for CLI logging.
 */
export const formatNotMatchingLog = (message: Difference) => {
  const flattenMessage = setValuesIfMissing(message);

  Object.keys(flattenMessage).forEach(key => {
    if (key === 'message' || key === 'path') {
      console.log(message[key]);
    } else {
      console.log(`${key}: ${message[key]}`);
    }
  });
};

/**
 * Checks if there is data piped, then collects it.
 * Otherwise returns empty string.
 */
const collectPipedData = async () => {
  if (process.stdin.isTTY) {
    return '';
  }

  const readline = createInterface({
    input: process.stdin,
  });

  const data: string[] = [];

  for await (const line of readline) {
    data.push(line);
  }

  return data.join('\n');
};

/**
 * Checks if there is piped data, tries to parse yaml from it.
 * Returns empty string if haven't found anything.
 */
export const parseManifestFromStdin = async () => {
  const pipedSourceManifest = await collectPipedData();

  if (!pipedSourceManifest) {
    return '';
  }

  const regex = /# start((?:.*\n)+?)# end/;
  const match = regex.exec(pipedSourceManifest);

  if (!match) {
    return '';
  }

  return match![1];
};
