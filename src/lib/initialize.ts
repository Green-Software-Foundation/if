import pathLib = require('path');

import {ERRORS} from '../util/errors';
import {logger} from '../util/logger';

import {CONFIG, STRINGS} from '../config';

import {PluginInterface, PluginParams} from '../types/interface';
import {PluginsStorage} from '../types/initialize';
import {GlobalPlugins} from '../types/manifest';

const {ModelInitializationError, ModelCredentialError} = ERRORS;

const {GITHUB_PATH, NATIVE_PLUGIN} = CONFIG;
const {
  MISSING_CLASSNAME,
  MISSING_PATH,
  NOT_NATIVE_PLUGIN,
  INVALID_MODULE_PATH,
} = STRINGS;

/**
 * Imports module by given `path`.
 */
const importModuleFrom = async (path: string) => {
  try {
    const module = await import(path);

    return module;
  } catch (error) {
    throw new ModelInitializationError(INVALID_MODULE_PATH(path));
  }
};

/**
 * Imports `module` from given `path`, then checks if it's `ModelPluginInterface` extension.
 */
const importAndVerifyModule = async (model: string, path: string) => {
  const pluginModule = await importModuleFrom(path);
  // check for plugin interface props here

  return pluginModule[model];
};

/**
 * Returns plugin model. Checks if model is missing then rejects with error.
 * Then checks if `path` is starting with github, then grabs the repository name.
 * Imports module, then checks if it's a class which implements input model interface.
 */
const handModel = (plugin: string, path: string) => {
  if (path === 'builtin') {
    path = pathLib.normalize(`${__dirname}/../models`);
  } else {
    if (path?.startsWith(GITHUB_PATH)) {
      const parts = path.split('/');
      path = parts[parts.length - 1];
    }

    if (!path.includes(NATIVE_PLUGIN)) {
      logger.warn(NOT_NATIVE_PLUGIN);
    }
  }

  return importAndVerifyModule(plugin, path);
};

/**
 * Initializes plugin with global config.
 */
const initPlugin = async (
  pluginParams: PluginParams
): Promise<PluginInterface> => {
  const {model, path} = pluginParams;

  if (!model) {
    throw new ModelCredentialError(MISSING_CLASSNAME);
  }

  if (!path) {
    throw new ModelCredentialError(MISSING_PATH);
  }

  const Model = await handModel(model, path);

  return Model();
};

/**
 * Registers all plugins from `manifest`.`initalize` property.
 */
export const initalize = async (
  plugins: GlobalPlugins
): Promise<PluginsStorage> => {
  const storage: PluginsStorage = {};

  for await (const pluginName of Object.keys(plugins)) {
    storage[pluginName] = await initPlugin(plugins[pluginName]);
  }

  return storage;
};
