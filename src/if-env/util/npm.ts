#!/usr/bin/env node
/* eslint-disable no-process-exit */
import * as fs from 'fs/promises';
import * as path from 'path';

import {execPromise} from '../../common/util/helpers';
import {isDirectoryExists, isFileExists} from '../../common/util/fs';
import {logger} from '../../common/util/logger';

import {STRINGS} from '../config';
import {ManifestPlugin, PathWithVersion} from '../types/npm';

const packageJson = require('../../../package.json');

const {INITIALIZING_PACKAGE_JSON, INSTALLING_NPM_PACKAGES} = STRINGS;

/**
 * Checks if the package.json is exists, if not, initializes it.
 */
export const initPackageJsonIfNotExists = async (folderPath: string) => {
  const packageJsonPath = path.resolve(folderPath, 'package.json');
  const isPackageJsonExists = await isFileExists(packageJsonPath);

  if (!isPackageJsonExists) {
    logger.info(INITIALIZING_PACKAGE_JSON);

    const nodeModulesPath = path.resolve(folderPath, 'node_modules');
    const isNodeModulesExists = await isDirectoryExists(nodeModulesPath);

    if (isNodeModulesExists) {
      await fs.rm(nodeModulesPath, {recursive: true});
    }

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

/**
 * Updates package.json dependencies.
 */
export const updatePackageJsonDependencies = async (
  packageJsonPath: string,
  dependencies: PathWithVersion,
  cwd: boolean
) => {
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');

  const parsedPackageJson = JSON.parse(packageJsonContent);

  if (cwd) {
    parsedPackageJson.dependencies = {
      ...parsedPackageJson.dependencies,
      ...dependencies,
    };
  } else {
    parsedPackageJson.dependencies = {...dependencies};
  }

  await fs.writeFile(
    packageJsonPath,
    JSON.stringify(parsedPackageJson, null, 2)
  );
  await fs.appendFile(packageJsonPath, '\n');
};

/**
 * Gets depencecies with versions.
 */
export const extractPathsWithVersion = (
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
 * Update the package.json properties.
 */
export const updatePackageJsonProperties = async (
  newPackageJsonPath: string,
  appendDependencies: boolean
) => {
  const packageJsonContent = await fs.readFile(newPackageJsonPath, 'utf8');
  const parsedPackageJsonContent = JSON.parse(packageJsonContent);

  const properties = {
    name: packageJson.name || 'if-environment',
    description: packageJson.description,
    author: packageJson.author,
    bugs: packageJson.bugs,
    engines: packageJson.engines,
    homepage: packageJson.homepage,
    dependencies: appendDependencies
      ? parsedPackageJsonContent.dependencies
      : {},
  };

  const newPackageJson = Object.assign(
    {},
    parsedPackageJsonContent,
    properties
  );

  await fs.writeFile(
    newPackageJsonPath,
    JSON.stringify(newPackageJson, null, 2)
  );
};
