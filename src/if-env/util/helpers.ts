/* eslint-disable no-process-exit */
import * as path from 'path';
import * as fs from 'fs/promises';
import {ERRORS} from '@grnsft/if-core/utils';

import {
  extractPathsWithVersion,
  initPackageJsonIfNotExists,
  installDependencies,
  updatePackageJsonDependencies,
  updatePackageJsonProperties,
} from './npm';
import {load} from '../../common/lib/load';

import {STRINGS} from '../config';

import {EnvironmentOptions} from '../types/if-env';

const {MissingPluginDependenciesError} = ERRORS;
const {
  FAILURE_MESSAGE_DEPENDENCIES,
  FAILURE_MESSAGE,
  FAILURE_MESSAGE_TEMPLATE,
} = STRINGS;

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
    throw new MissingPluginDependenciesError(FAILURE_MESSAGE_DEPENDENCIES);
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

    await updatePackageJsonProperties(packageJsonPath, cwd);

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

    const destinationPath = path.resolve(destinationDir, 'manifest.yml');
    const data = await fs.readFile(templateManifest, 'utf-8');

    await fs.writeFile(destinationPath, data, 'utf-8');
  } catch (error) {
    console.log(FAILURE_MESSAGE_TEMPLATE);
    process.exit(1);
  }
};
