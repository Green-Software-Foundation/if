#!/usr/bin/env node
/* eslint-disable no-process-exit */
import * as fs from 'fs/promises';
import * as path from 'path';

import {installDependencies, initPackageJsonIfNotExists} from './util/helpers';
import {parseIfEnvArgs} from './util/args';
import {logger} from './util/logger';

import {load} from './lib/load';

import {CONFIG} from './config';

import {
  EnvironmentOptions,
  ManifestPlugin,
  PathWithVersion,
} from './types/if-env';

const packageJson = require('../package.json');

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
    cmd: !!commandArgs.cmd,
  };

  if (commandArgs && commandArgs.manifest) {
    const {folderPath, install, dependencies} =
      await getOptionsFromArgs(commandArgs);
    options.folderPath = commandArgs.cmd ? options.folderPath : folderPath;
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
 * Gets depencecies with versions.
 */
const extractPathsWithVersion = (
  plugins: ManifestPlugin,
  dependencies: string[]
) => {
  const paths = Object.keys(plugins).map(plugin => plugins[plugin].path);
  const uniquePaths = [...new Set(paths)].filter(path => path !== 'builtin');
  const pathsWithVersion: PathWithVersion = {};

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
const initializeAndInstallLibs = async (options: EnvironmentOptions) => {
  try {
    const {folderPath, install, cmd, dependencies} = options;
    const packageJsonPath = await initPackageJsonIfNotExists(folderPath);

    await updatePackageJsonProperties(packageJsonPath);

    if (install) {
      await installDependencies(folderPath, dependencies);
    } else {
      await updatePackageJsonDependencies(packageJsonPath, dependencies, cmd);
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
  dependencies: PathWithVersion,
  cmd: boolean
) => {
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);

  if (cmd) {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...dependencies,
    };
  } else {
    packageJson.dependencies = {...dependencies};
  }

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

/**
 * Adds a manifest template to the folder where the if-env CLI command runs.
 */
const addTemplateManifest = async (destinationDir: string) => {
  try {
    const templateManifest = path.resolve(__dirname, './env-template.yml');
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
