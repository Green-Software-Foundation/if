import pathLib = require('path');

import {ERRORS} from '../util/errors';
import {Logger} from '../util/logger';
import {memoizedLog} from '../util/log-memoize';
import {pluginStorage} from '../util/plugin-storage';

import {CONFIG, STRINGS} from '../config';

import {PluginInterface} from '../types/interface';
import {GlobalPlugins, PluginOptions} from '../types/manifest';
import {PluginStorageInterface} from '../types/plugin-storage';

const {ModuleInitializationError, PluginCredentialError} = ERRORS;

const {GITHUB_PATH, NATIVE_PLUGIN} = CONFIG;
const {MISSING_METHOD, MISSING_PATH, NOT_NATIVE_PLUGIN, INVALID_MODULE_PATH} =
  STRINGS;

const logger = Logger('Manifest');

/**
 * Imports module by given `path`.
 */
const importModuleFrom = async (path: string) => {
  try {
    const module = await import(path);

    return module;
  } catch (error) {
    logger.error(error);
    throw new ModuleInitializationError(INVALID_MODULE_PATH(path));
  }
};

/**
 * Imports `module` from given `path`, then checks if it's `ModelPluginInterface` extension.
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
const handModule = (method: string, path: string) => {
  if (path === 'builtin') {
    path = pathLib.normalize(`${__dirname}/../builtins`);
  } else {
    if (path?.startsWith(GITHUB_PATH)) {
      const parts = path.split('/');
      path = parts[parts.length - 1];
    }

    if (!path.includes(NATIVE_PLUGIN)) {
      memoizedLog(logger.warn, NOT_NATIVE_PLUGIN(path));
    }
  }

  return importAndVerifyModule(method, path);
};

/**
 * Initializes plugin with global config.
 */
const initPlugin = async (
  initPluginParams: PluginOptions
): Promise<PluginInterface> => {
  const {method, path, 'global-config': globalConfig} = initPluginParams;

  if (!method) {
    throw new PluginCredentialError(MISSING_METHOD);
  }

  if (!path) {
    throw new PluginCredentialError(MISSING_PATH);
  }

  const plugin = await handModule(method, path);

  return plugin(globalConfig);
};

/**
 * Registers all plugins from `manifest`.`initalize` property.
 */
export const initalize = async (
  plugins: GlobalPlugins
): Promise<PluginStorageInterface> => {
  const storage = pluginStorage();

  for await (const pluginName of Object.keys(plugins)) {
    const plugin = await initPlugin(plugins[pluginName]);
    storage.set(pluginName, plugin);
  }

  return storage;
};
