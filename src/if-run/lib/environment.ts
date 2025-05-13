import {osInfo} from '../util/os-checker';
import {execPromise} from '../../common/util/helpers';
import type {Execution, Manifest} from '../../common/types/manifest';

import {STRINGS} from '../config/strings';
import {NpmListResponse, PackageDependency} from '../types/environment';

const packageJson = require('../../../package.json');

const {CAPTURING_RUNTIME_ENVIRONMENT_DATA} = STRINGS;

/**
 * 1. Gets the process uptime (the number of seconds the current Node.js process has been running).
 * 2. Converts the uptime to milliseconds.
 * 3. Gets the current DateTime.
 * 4. Subtracts the milliseconds from the current DateTime.
 */
const getProcessStartingTimestamp = () => {
  const seconds = process.uptime();
  const milliseconds = seconds * 1000;

  const currentDateTime = Date.now();

  const applicationStartDateTime = currentDateTime - milliseconds;

  return new Date(applicationStartDateTime).toISOString();
};

/**
 * Goes through the dependencies, converts them into oneliner.
 */
const flattenDependencies = (dependencies: [string, PackageDependency][]) =>
  dependencies.map(dependency => {
    const [packageName, versionInfo] = dependency;
    const {version, extraneous, resolved} = versionInfo;
    const ifExtraneous = extraneous ? ` extraneous -> ${resolved}` : '';
    const ifFromGithub =
      resolved && resolved.startsWith('git') ? ` (${resolved})` : '';
    const formattedString = `${packageName}@${version}${
      ifExtraneous || ifFromGithub
    }`;

    return formattedString;
  });

/**
 * 1. Runs `npm list --json --omit=dev`.
 * 2. Parses json data and converts to list.
 */
const listDependencies = async () => {
  const {stdout} = await execPromise('npm list --json --omit=dev');
  const npmListResponse: NpmListResponse = JSON.parse(stdout);

  if (npmListResponse.dependencies) {
    const dependencies = Object.entries(npmListResponse.dependencies);

    return flattenDependencies(dependencies);
  }

  return [];
};

/**
 * Get execution information (command, environment).
 */
export const getExecution = async (): Promise<Execution> => {
  console.debug(CAPTURING_RUNTIME_ENVIRONMENT_DATA);

  const dependencies = await listDependencies();
  const info = await osInfo();
  const dateTime = `${getProcessStartingTimestamp()} (UTC)`;

  return {
    status: 'success',
    command: process.argv.join(' '),
    environment: {
      'if-version': packageJson.version,
      os: info.os,
      'os-version': info['os-version'],
      'node-version': process.versions.node,
      'date-time': dateTime,
      dependencies,
    },
  };
};

/**
 * Injects execution information (command, environment) to existing manifest.
 */
export const injectEnvironment = async (
  manifest: Manifest
): Promise<Manifest> => ({
  ...manifest,
  execution: await getExecution(),
});
