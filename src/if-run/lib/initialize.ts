import * as path from 'node:path';

import {ERRORS} from '@grnsft/if-core/utils';
import {PluginInterface} from '@grnsft/if-core/types';

import {storeAggregationMetrics} from './aggregate';

import {logger} from '../../common/util/logger';
import {memoizedLog} from '../util/log-memoize';
import {pluginStorage} from '../util/plugin-storage';

import {CONFIG, STRINGS} from '../config';

import {Context, PluginOptions} from '../../common/types/manifest';
import {PluginStorageInterface} from '../types/plugin-storage';

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
 * Whether to output warnings for external plugins
 */
let enableExternalPluginWarning = true;

/**
 * Set whether to output warnings for external plugins.
 * @param enable true if warnings for external plugins should be output
 */
export const setExternalPluginWarning = (enable: boolean) => {
  enableExternalPluginWarning = enable;
};

/**
 * List of plugins to disable
 */
let disabledPlugins = new Set<string>();

/**
 * Set plugins to be disabled.
 * Each element is specified in the format `plugin-path:method-name`.
 * Built-in plugins are specified as `builtin:method-name`.
 * @param pluginsToBeDisabled List of plugins to be disabled
 */
export const setDisabledPlugins = (pluginsToBeDisabled: Set<string>) => {
  disabledPlugins = pluginsToBeDisabled;
};

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
    if (disabledPlugins.has('builtin:' + method)) {
      throw new PluginInitializationError(
        INVALID_MODULE_PATH(`builtin:${method}`)
      );
    }
    pluginPath = path.normalize(`${__dirname}/../builtins`);
  } else {
    if (pluginPath?.startsWith(GITHUB_PATH)) {
      const parts = pluginPath.split('/');
      pluginPath = parts[parts.length - 1];
    }

    pluginPath = path.normalize(pluginPath);
    if (
      pluginPath.startsWith('../') ||
      disabledPlugins.has(`${pluginPath}:${method}`)
    ) {
      throw new PluginInitializationError(
        INVALID_MODULE_PATH(`${pluginPath}:${method}`)
      );
    }

    if (enableExternalPluginWarning && !pluginPath.includes(NATIVE_PLUGIN)) {
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
