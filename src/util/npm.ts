#!/usr/bin/env node
/* eslint-disable no-process-exit */
import * as fs from 'fs/promises';
import * as path from 'path';

import {execPromise} from './helpers';
import {getFileName, isFileExists} from './fs';
import {logger} from './logger';

import {STRINGS} from '../config';
import {ManifestPlugin, PathWithVersion} from '../types/npm';

const packageJson = require('../../package.json');

const {INITIALIZING_PACKAGE_JSON, INSTALLING_NPM_PACKAGES} = STRINGS;

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
    name: 'if-environment',
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

/**
 * Executes a series of npm commands based on the provided manifest file.
 */
export const executeCommands = async (manifest: string, cwd: boolean) => {
  // TODO: After release remove isGlobal and appropriate checks
  const isGlobal = !!process.env.npm_config_global;
  const manifestDirPath = path.dirname(manifest);
  const manifestFileName = getFileName(manifest);
  const executedManifest = path.join(manifestDirPath, `re-${manifestFileName}`);
  const ifEnv = `${isGlobal ? 'if-env' : 'npm run if-env --'} -m ${manifest}`;
  const ifEnvCommand = cwd ? `${ifEnv} -c` : ifEnv;
  const ifRunCommand = `${
    isGlobal ? 'if-run' : 'npm run if-run --'
  } -m ${manifest} -o ${executedManifest}`;
  const ifDiffCommand = `${
    isGlobal ? 'if-diff' : 'npm run if-diff --'
  } -s ${executedManifest}.yaml -t ${manifest}`;
  const ttyCommand = " node -p 'Boolean(process.stdout.isTTY)'";

  const result = await execPromise(
    `${ifEnvCommand} && ${ifRunCommand} && ${ttyCommand} | ${ifDiffCommand}`,
    {
      cwd: process.env.CURRENT_DIR || process.cwd(),
    }
  );

  if (!cwd) {
    await fs.unlink(`${manifestDirPath}/package.json`);
  }

  await fs.unlink(`${executedManifest}.yaml`);

  if (result.stdout) {
    const logs = result.stdout.split('\n\n');
    const successMessage = logs[logs.length - 1];

    console.log(successMessage);
  }
};
