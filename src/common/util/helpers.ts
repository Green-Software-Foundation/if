import {createInterface} from 'node:readline/promises';
import {exec} from 'child_process';
import * as path from 'path';
import {promisify} from 'util';
import {MappingParams, PluginParams} from '@grnsft/if-core/types';

/**
 * Promise version of Node's `exec` from `child-process`.
 */
export const execPromise = promisify(exec);

/**
 * Prepends process path to given `filePath`.
 */
export const prependFullFilePath = (filePath: string) => {
  const processRunningPath = process.cwd();

  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  return path.normalize(`${processRunningPath}/${filePath}`);
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
 * Maps input data if the mapping has valid data.
 */
export const mapInputIfNeeded = (
  input: PluginParams,
  mapping: MappingParams
) => {
  const newInput = Object.assign({}, input);

  Object.entries(mapping || {}).forEach(([key, value]) => {
    if (value in newInput) {
      const mappedKey = input[value];
      newInput[key] = mappedKey;
      delete newInput[value];
    }
  });

  return newInput;
};

/**
 * Maps config data if the mapping hass valid data.
 */
export const mapConfigIfNeeded = (config: any, mapping: MappingParams) => {
  if (!mapping) {
    return config;
  }

  if (typeof config !== 'object' || config === null) {
    return config;
  }

  const result: Record<string, any> = Array.isArray(config) ? [] : {};

  Object.entries(config).forEach(([key, value]) => {
    const mappedKey = mapping[key] || key;

    if (typeof value === 'object' && value !== null) {
      result[mappedKey] = mapConfigIfNeeded(value, mapping);
    } else {
      result[mappedKey] =
        typeof value === 'string' && value in mapping ? mapping[value] : value;
    }
  });

  return result;
};

/**
 * Maps the output parameter of the plugin if the `mapping` parameter is provided.
 */
export const mapOutputIfNeeded = (
  output: PluginParams,
  mapping: MappingParams
) => {
  if (!mapping) return output;

  return Object.entries(output).reduce((acc, [key, value]) => {
    if (key in mapping) {
      acc[mapping[key]] = value;
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as PluginParams);
};
