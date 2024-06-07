#!/usr/bin/env node
/* eslint-disable no-process-exit */
import * as fs from 'fs/promises';
import * as path from 'path';

import {execPromise, isFileExists} from '../util/helpers';
import {parseIfEnvArgs} from '../util/args';
import {logger} from '../util/logger';

import {load} from '../lib/load';

import {CONFIG} from '../config';

const packageJson = require('../../package.json');

const {IF_ENV} = CONFIG;
const {
  SUCCESS_MESSAGE,
  FAILURE_MESSAGE,
  FAILURE_MESSAGE_TEMPLATE,
  FAILURE_MESSAGE_DEPENDENCIES,
} = IF_ENV;

const FOLDER_NAME = 'if-environment';

type EnvironmentOptions = {
  folderPath: string;
  install: boolean;
  dependencies: {[path: string]: string};
};

const IfEnv = async () => {
  const commandArgs = await parseIfEnvArgs();
  const options: EnvironmentOptions = {
    folderPath: path.resolve(__dirname, FOLDER_NAME),
    install: true,
    dependencies: {'@grnsft/if': packageJson.version},
  };

  if (commandArgs) {
    const {folderPath, install, dependencies} =
      await getOptionsFromArgs(commandArgs);
    options.folderPath = folderPath;
    options.install = !!install;
    options.dependencies = {...options.dependencies, ...dependencies};
  }

  await initializeAndInstallLibs(options);

  if (!commandArgs) {
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
 * Gets depencecies with versions.
 */
const extractPathsWithVersion = (
  plugins: any,
  dependencies: string[]
): {[path: string]: string} => {
  const paths = Object.keys(plugins).map(plugin => plugins[plugin].path);
  const uniquePaths = [...new Set(paths)].filter(path => path !== 'builtin');
  const pathsWithVersion: {[path: string]: string} = {};

  uniquePaths.forEach(pluginPath => {
    const dependency = dependencies.find((dependency: string) =>
      dependency.startsWith(pluginPath)
    );

    if (dependency) {
      const splittedDependency = dependency.split('@');
      const version =
        splittedDependency.length > 2
          ? splittedDependency[2].split(' ')[0]
          : splittedDependency[1];

      pathsWithVersion[pluginPath] = `^${version}`;
    }
  });

  return pathsWithVersion;
};

/**
 * Creates folder if not exists, installs dependencies if required, update depenedencies.
 */
async function initializeAndInstallLibs(options: EnvironmentOptions) {
  try {
    const {folderPath, install, dependencies} = options;

    await fs.mkdir(folderPath, {recursive: true});

    const packageJsonPath = await ensurePackageJsonExists(folderPath);

    if (install) {
      await installDependencies(folderPath, dependencies);
    } else {
      await updatePackageJsonDependencies(packageJsonPath, dependencies);
    }
  } catch (error) {
    console.log(FAILURE_MESSAGE);
  }
}

/**
 * Checks if the package.json is exists, if not, inisializes it.
 */
async function ensurePackageJsonExists(folderPath: string) {
  const packageJsonPath = path.resolve(folderPath, 'package.json');
  const isPackageJsonExists = await isFileExists(packageJsonPath);

  if (!isPackageJsonExists) {
    await execPromise('npm init -y', {cwd: folderPath});
  }

  return packageJsonPath;
}

/**
 * Installs packages from the specified dependencies in the specified folder.
 */
async function installDependencies(
  folderPath: string,
  dependencies: {[path: string]: string}
) {
  const packages = Object.entries(dependencies).map(
    ([dependency, version]) => `${dependency}@${version.replace('^', '')}`
  );

  await execPromise(`npm install ${packages.join(' ')}`, {
    cwd: folderPath,
  });
}

/**
 * Updates package.json dependencies.
 */
async function updatePackageJsonDependencies(
  packageJsonPath: string,
  dependencies: {[path: string]: string}
) {
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);

  packageJson.dependencies = {
    ...packageJson.dependencies,
    ...dependencies,
  };

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

/**
 * Adds a manifest template to the folder where the if-env CLI command runs.
 */
async function addTemplateManifest() {
  try {
    const templateManifest = path.resolve(__dirname, 'template.yml');
    const destinationPath = path.resolve(
      __dirname,
      FOLDER_NAME,
      'manifest.yml'
    );

    const data = await fs.readFile(templateManifest, 'utf-8');
    await fs.writeFile(destinationPath, '', 'utf-8');
    await fs.writeFile(destinationPath, data, 'utf-8');
  } catch (error) {
    console.log(FAILURE_MESSAGE_TEMPLATE);
  }
}

IfEnv().catch(error => {
  if (error instanceof Error) {
    logger.error(error);
    process.exit(2);
  }
});
