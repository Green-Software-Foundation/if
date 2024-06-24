#!/usr/bin/env node
/* eslint-disable no-process-exit */
import {createInterface} from 'node:readline/promises';
import {exec} from 'node:child_process';
import {promisify} from 'node:util';

import * as fs from 'fs/promises';
import * as path from 'path';

import {ERRORS} from '@grnsft/if-core/utils';

import {STRINGS, CONFIG} from '../config';

import {Difference} from '../types/lib/compare';

import {load} from '../lib/load';

import {
  installDependencies,
  initPackageJsonIfNotExists,
  updatePackageJsonDependencies,
  extractPathsWithVersion,
  updatePackageJsonProperties,
} from './npm';

import {logger} from './logger';
import {EnvironmentOptions} from '../types/if-env';

const {IF_ENV} = CONFIG;
const {
  FAILURE_MESSAGE,
  FAILURE_MESSAGE_TEMPLATE,
  FAILURE_MESSAGE_DEPENDENCIES,
} = IF_ENV;

const {UNSUPPORTED_ERROR} = STRINGS;

/**
 * Impact engine error handler. Logs errors and appends issue template if error is unknown.
 */
export const andHandle = (error: Error) => {
  const knownErrors = Object.keys(ERRORS);

  logger.error(error);

  if (!knownErrors.includes(error.name)) {
    logger.error(UNSUPPORTED_ERROR(error.name));
    // eslint-disable-next-line no-process-exit
    process.exit(2);
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
 * Gets the folder path of the manifest file, dependencies from manifest file and install argument from the given arguments.
 */
export const getOptionsFromArgs = async (commandArgs: {
  manifest: string;
  install: boolean | undefined;
}) => {
  const {manifest, install} = commandArgs;
  const folderPath = path.dirname(manifest);
  const loadedManifest = await load(manifest);
  const rawManifest = loadedManifest.rawManifest;
  const plugins = rawManifest?.initialize?.plugins || {};
  const dependencies = rawManifest?.execution?.environment.dependencies || [];

  if (!dependencies.length) {
    throw new Error(FAILURE_MESSAGE_DEPENDENCIES);
  }

  const pathsWithVersion = extractPathsWithVersion(plugins, dependencies);

  return {
    folderPath,
    dependencies: pathsWithVersion,
    install,
  };
};

/**
 * Creates folder if not exists, installs dependencies if required, update depenedencies.
 */
export const initializeAndInstallLibs = async (options: EnvironmentOptions) => {
  try {
    const {folderPath, install, cwd, dependencies} = options;
    const packageJsonPath = await initPackageJsonIfNotExists(folderPath);

    await updatePackageJsonProperties(packageJsonPath, !cwd);

    if (install) {
      await installDependencies(folderPath, dependencies);
    } else {
      await updatePackageJsonDependencies(packageJsonPath, dependencies, cwd);
    }
  } catch (error) {
    console.log(FAILURE_MESSAGE);
    process.exit(2);
  }
};

/**
 * Adds a manifest template to the folder where the if-env CLI command runs.
 */
export const addTemplateManifest = async (destinationDir: string) => {
  try {
    const templateManifest = path.resolve(
      __dirname,
      '../config/env-template.yml'
    );

    console.log('--templateManifest', templateManifest);

    const destinationPath = path.resolve(destinationDir, 'manifest.yml');

    const data = await fs.readFile(templateManifest, 'utf-8');
    console.log('--after read');
    await fs.writeFile(destinationPath, '', 'utf-8');
    await fs.writeFile(destinationPath, data, 'utf-8');
  } catch (error) {
    console.log('---errr', error);
    console.log(FAILURE_MESSAGE_TEMPLATE);
    process.exit(1);
  }
};
