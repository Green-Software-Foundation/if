#!/usr/bin/env node
/* eslint-disable no-process-exit */
import * as fs from 'fs/promises';
import * as path from 'path';

import {installDependencies, initPackageJsonIfNotExists} from './util/helpers';
import {parseIfEnvArgs} from './util/args';
import {logger} from './util/logger';

import {load} from './lib/load';

import {CONFIG} from './config';

import {EnvironmentOptions, PathWithVersion} from './types/if-env';

const packageJson = require('../package.json');

const {IF_ENV} = CONFIG;
const {
  SUCCESS_MESSAGE,
  FAILURE_MESSAGE,
  FAILURE_MESSAGE_TEMPLATE,
  FAILURE_MESSAGE_DEPENDENCIES,
} = IF_ENV;

const IfEnv = async () => {
  console.log(process.env.CURRENT_DIR);
  const commandArgs = await parseIfEnvArgs();
  const options: EnvironmentOptions = {
    folderPath: process.env.CURRENT_DIR || process.cwd(),
    install: !!commandArgs.install,
    dependencies: {},
  };

  if (commandArgs && commandArgs.manifest) {
    const {folderPath, install, dependencies} =
      await getOptionsFromArgs(commandArgs);
    options.folderPath = folderPath;
    options.install = !!install;
    options.dependencies = {...dependencies};
  } else {
    options.dependencies = {
      ...packageJson.depencecies,
      ...packageJson.devDependencies,
    };
  }

  await initializeAndInstallLibs(options);

  if (!commandArgs || !commandArgs.manifest) {
    await addTemplateManifest();
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
  const dependencies =
    manifest.rawManifest?.execution?.environment.dependencies || [];

  if (!dependencies.length) {
    throw new Error(FAILURE_MESSAGE_DEPENDENCIES);
  }

  const pathsWithVersion = extractPathsWithVersion(dependencies);

  return {
    folderPath,
    dependencies: pathsWithVersion,
    install,
  };
};

/**
 * Gets depencecies with versions.
 */
const extractPathsWithVersion = (dependencies: string[]) => {
  const pathsWithVersion: PathWithVersion = {};

  dependencies.forEach(dependency => {
    const splittedDependency = dependency.split('@');
    const packageName =
      splittedDependency.length > 2
        ? `@${splittedDependency[1]}`
        : `@${splittedDependency[0]}`;
    const version =
      splittedDependency.length > 2
        ? splittedDependency[2].split(' ')[0]
        : splittedDependency[1];

    pathsWithVersion[packageName] = `^${version}`;
  });

  return pathsWithVersion;
};

/**
 * Creates folder if not exists, installs dependencies if required, update depenedencies.
 */
const initializeAndInstallLibs = async (options: EnvironmentOptions) => {
  try {
    const {folderPath, install, dependencies} = options;

    if (!Object.keys(dependencies).length) {
      throw new Error(FAILURE_MESSAGE_DEPENDENCIES);
    }

    await fs.mkdir(folderPath, {recursive: true});

    const packageJsonPath = await initPackageJsonIfNotExists(folderPath);
    await updatePackageJsonProperties(packageJsonPath);

    if (install) {
      await installDependencies(folderPath, dependencies);
    } else {
      await updatePackageJsonDependencies(packageJsonPath, dependencies);
    }
  } catch (error) {
    console.log(FAILURE_MESSAGE);
    process.exit(2);
  }
};

/**
 * Update the package.json properties.
 */
const updatePackageJsonProperties = async (packageJsonPath: string) => {
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
  const parsedPackageJsonContent = JSON.parse(packageJsonContent);

  const properties = {
    name: 'if-environment',
    description: packageJson.description,
    author: packageJson.author,
    bugs: packageJson.bugs,
    engines: packageJson.engines,
    homepage: packageJson.homepage,
  };

  const newPackageJson = Object.assign(
    {},
    parsedPackageJsonContent,
    properties
  );

  await fs.writeFile(packageJsonPath, JSON.stringify(newPackageJson, null, 2));
};

/**
 * Updates package.json dependencies.
 */
const updatePackageJsonDependencies = async (
  packageJsonPath: string,
  dependencies: PathWithVersion
) => {
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);

  packageJson.dependencies = {
    ...packageJson.dependencies,
    ...dependencies,
  };

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

/**
 * Adds a manifest template to the folder where the if-env CLI command runs.
 */
const addTemplateManifest = async () => {
  try {
    const templateManifest = path.resolve(__dirname, './env-template.yml');
    const destinationPath = path.resolve(__dirname, 'manifest.yml');

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
