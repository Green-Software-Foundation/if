import * as path from 'node:path';

import {ERRORS} from '@grnsft/if-core/utils';
import {PluginInterface} from '@grnsft/if-core/types';

import {logger} from '../../common/util/logger';
import {memoizedLog} from '../util/log-memoize';
import {pluginStorage} from '../util/plugin-storage';

import {CONFIG, STRINGS} from '../config';

import {Context, PluginOptions} from '../../common/types/manifest';
import {PluginStorageInterface} from '../types/plugin-storage';
import {storeAggregationMetrics} from './aggregate';

const {
  PluginInitializationError,
  MissingPluginMethodError,
  MissingPluginPathError,
} = ERRORS;

const {GITHUB_PATH, NATIVE_PLUGIN} = CONFIG;
const {
  MISSING_METHOD,
  MISSING_PATH,
  NOT_NATIVE_PLUGIN,
  INVALID_MODULE_PATH,
  LOADING_PLUGIN_FROM_PATH,
  INITIALIZING_PLUGIN,
  INITIALIZING_PLUGINS,
} = STRINGS;

/**
 * Imports module by given `path`.
 */
const importModuleFrom = async (path: string) => {
  const module = await import(path).catch(error => {
    throw new PluginInitializationError(INVALID_MODULE_PATH(path, error));
  });

  return module;
};

/**
 * Imports `module` from given `path` and returns requested `method`.
 */
const importAndVerifyModule = async (method: string, path: string) => {
  const pluginModule = await importModuleFrom(path);

  return pluginModule[method];
};

/**
 * Checks if plugin is missing then rejects with error.
 * Then checks if `path` is starting with github, then grabs the repository name.
 * Imports module, then checks if it's a valid plugin.
 */
const handModule = (method: string, pluginPath: string) => {
  console.debug(LOADING_PLUGIN_FROM_PATH(method, pluginPath), '\n');

  if (pluginPath === 'builtin') {
    pluginPath = path.normalize(`${__dirname}/../builtins`);
  } else {
    if (pluginPath?.startsWith(GITHUB_PATH)) {
      const parts = pluginPath.split('/');
      pluginPath = parts[parts.length - 1];
    }

    if (!pluginPath.includes(NATIVE_PLUGIN)) {
      memoizedLog(logger.warn, NOT_NATIVE_PLUGIN(pluginPath));
    }
  }

  return importAndVerifyModule(method, pluginPath);
};

/**
 * Initializes plugin with config.
 */
const initPlugin = async (
  initPluginParams: PluginOptions
): Promise<PluginInterface> => {
  const {
    method,
    path,
    mapping,
    config,
    'parameter-metadata': parameterMetadata,
  } = initPluginParams!;

  if (!method) {
    throw new MissingPluginMethodError(MISSING_METHOD);
  }

  if (!path) {
    throw new MissingPluginPathError(MISSING_PATH);
  }

  const plugin = await handModule(method, path);

  return plugin(config, parameterMetadata, mapping);
};

/**
 * Registers all plugins from `manifest`.`initialize` property.
 * 1. Initalizes plugin storage.
 * 2. Iterates over plugin names array.
 * 3. While iteration, initalizes current plugin, gathers it's parameters (input/output).
 *    Then stores the aggregation metrics for each parameter to override stub values.
 */
export const initialize = async (
  context: Context
): Promise<PluginStorageInterface> => {
  console.debug(INITIALIZING_PLUGINS, '\n');
  const {plugins} = context.initialize;
  const storage = pluginStorage();

  for await (const pluginName of Object.keys(plugins)) {
    console.debug(INITIALIZING_PLUGIN(pluginName));

    const plugin = await initPlugin(plugins[pluginName]);
    const parameters = {...plugin.metadata.inputs, ...plugin.metadata.outputs};

    Object.keys(parameters).forEach(current => {
      storeAggregationMetrics({
        [current]: parameters[current]['aggregation-method'],
      });
    });

    storage.set(pluginName, plugin);
  }

  return storage;
};
