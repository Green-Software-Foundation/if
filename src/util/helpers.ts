import * as fs from 'fs/promises';
import * as path from 'path';
import {createInterface} from 'node:readline/promises';
import {exec} from 'node:child_process';
import {promisify} from 'node:util';

import {ERRORS} from '@grnsft/if-core';

import {logger} from './logger';

import {STRINGS} from '../config';

import {Difference} from '../types/lib/compare';

const {ISSUE_TEMPLATE, INITIALIZING_PACKAGE_JSON, INSTALLING_NPM_PACKAGES} =
  STRINGS;

/**
 * Impact engine error handler. Logs errors and appends issue template if error is unknown.
 */
export const andHandle = (error: Error) => {
  const knownErrors = Object.keys(ERRORS);

  logger.error(error);

  if (!knownErrors.includes(error.name)) {
    logger.warn(ISSUE_TEMPLATE);
  }
};

/**
 * Append entries from defaults which are missing from inputs.
 */
export const mergeObjects = (defaults: any, input: any) => {
  const merged: Record<string, any> = structuredClone(input);

  for (const key in defaults) {
    if (!(key in input)) {
      merged[key] = defaults[key];
    }

    if (merged[key] === undefined || merged[key] === null) {
      merged[key] = defaults[key];
    }
  }

  return merged;
};

/**
 * Promise version of Node's `exec` from `child-process`.
 */
export const execPromise = promisify(exec);

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

/**
 * Checks if file exists with the given `filePath`.
 */
export const isFileExists = async (filePath: string) => {
  try {
    await fs.stat(filePath);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Checks if the package.json is exists, if not, inisializes it.
 */
export const initPackageJsonIfNotExists = async (folderPath: string) => {
  const packageJsonPath = path.resolve(folderPath, 'package.json');
  const isPackageJsonExists = await isFileExists(packageJsonPath);

  if (!isPackageJsonExists) {
    logger.info(INITIALIZING_PACKAGE_JSON);
    await execPromise('npm init -y', {cwd: folderPath});
  }

  return packageJsonPath;
};

/**
 * Installs packages from the specified dependencies in the specified folder.
 */
export const installDependencies = async (
  folderPath: string,
  dependencies: {[path: string]: string}
) => {
  const packages = Object.entries(dependencies).map(
    ([dependency, version]) => `${dependency}@${version.replace('^', '')}`
  );

  logger.info(INSTALLING_NPM_PACKAGES);
  await execPromise(`npm install ${packages.join(' ')}`, {
    cwd: folderPath,
  });
};
