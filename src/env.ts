#!/usr/bin/env node
/* eslint-disable no-process-exit */
import * as fs from 'fs/promises';
import * as path from 'path';

import {
  installDependencies,
  initPackageJsonIfNotExists,
  updatePackageJsonDependencies,
  extractPathsWithVersion,
  updatePackageJsonProperties,
} from './util/npm';
import {parseIfEnvArgs} from './util/args';
import {logger} from './util/logger';

import {load} from './lib/load';

import {CONFIG} from './config';

import {EnvironmentOptions} from './types/if-env';

const {IF_ENV} = CONFIG;
const {
  SUCCESS_MESSAGE,
  FAILURE_MESSAGE,
  FAILURE_MESSAGE_TEMPLATE,
  FAILURE_MESSAGE_DEPENDENCIES,
} = IF_ENV;

const IfEnv = async () => {
  const commandArgs = await parseIfEnvArgs();
  const options: EnvironmentOptions = {
    folderPath: process.env.CURRENT_DIR || process.cwd(),
    install: !!commandArgs.install,
    dependencies: {},
    cwd: !!commandArgs.cwd,
  };

  if (commandArgs && commandArgs.manifest) {
    const {folderPath, install, dependencies} =
      await getOptionsFromArgs(commandArgs);
    options.folderPath = commandArgs.cwd ? options.folderPath : folderPath;
    options.install = !!install;
    options.dependencies = {...dependencies};
  }

  await initializeAndInstallLibs(options);

  if (!commandArgs || !commandArgs.manifest) {
    await addTemplateManifest(options.folderPath);
  }

  console.log(SUCCESS_MESSAGE);
  process.exit(0);
};

/**
 * Gets the folder path of manifest file, dependencies from manifest file and install argument from the given arguments.
 */
const getOptionsFromArgs = async (commandArgs: {
  manifest: string;
  install: boolean | undefined;
}) => {
  const {manifest: manifestPath, install} = commandArgs;
  const folderPath = path.dirname(manifestPath);
  const manifest = await load(manifestPath);
  const plugins = manifest.rawManifest?.initialize?.plugins || {};
  const dependencies =
    manifest.rawManifest?.execution?.environment.dependencies || [];

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
const initializeAndInstallLibs = async (options: EnvironmentOptions) => {
  try {
    const {folderPath, install, cwd, dependencies} = options;
    const packageJsonPath = await initPackageJsonIfNotExists(folderPath);

    await updatePackageJsonProperties(packageJsonPath);

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
const addTemplateManifest = async (destinationDir: string) => {
  try {
    const templateManifest = path.resolve(
      __dirname,
      './config/env-template.yml'
    );
    const destinationPath = path.resolve(destinationDir, 'manifest.yml');

    const data = await fs.readFile(templateManifest, 'utf-8');
    await fs.writeFile(destinationPath, '', 'utf-8');
    await fs.writeFile(destinationPath, data, 'utf-8');
  } catch (error) {
    console.log(FAILURE_MESSAGE_TEMPLATE);
    process.exit(1);
  }
};

IfEnv().catch(error => {
  if (error instanceof Error) {
    logger.error(error);
    process.exit(2);
  }
});
