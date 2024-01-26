import pathLib = require('path');

import {ERRORS} from '../util/errors';

import {CONFIG, STRINGS} from '../config';

import {
  ClassContainerParams,
  ImplInitializeModel,
  InitalizedModels,
  ModelOptions,
} from '../types/models-universe';

const {ModelInitializationError, ModelCredentialError} = ERRORS;

const {GITHUB_PATH, NATIVE_MODEL} = CONFIG;
const {
  MISSING_CLASSNAME,
  NOT_MODEL_PLUGIN_EXTENSION,
  MISSING_PATH,
  NOT_NATIVE_MODEL,
  NOT_CONSTRUCTABLE_MODEL,
  NOT_INITIALIZED_MODEL,
  INVALID_MODULE_PATH,
} = STRINGS;

/**
 * Models Initialization Lifecycle.
 */
export class ModelsUniverse {
  /**
   * Models list.
   */
  public initalizedModels: InitalizedModels = {};

  /**
   * Checks if plugin is instance of `IOutputModelInterface`.
   */
  private instanceOfModel(ClassContainer: any, params: ClassContainerParams) {
    try {
      const testModel = new ClassContainer();
      const boolable = 'configure' in testModel && 'execute' in testModel;

      return boolable;
    } catch (error) {
      throw new ModelInitializationError(NOT_CONSTRUCTABLE_MODEL(params));
    }
  }

  /**
   * Imports module by given `path`.
   */
  private async importModuleFrom(path: string) {
    try {
      const module = await import(path);

      return module;
    } catch (error) {
      console.log(error);
      throw new ModelInitializationError(INVALID_MODULE_PATH(path));
    }
  }

  /**
   * Imports `module` from given `path`, then checks if it's `ModelPluginInterface` extension.
   */
  private async importAndVerifyModule(plugin: string, path: string) {
    const pluginModule = await this.importModuleFrom(path);

    if (!this.instanceOfModel(pluginModule[plugin], {plugin, path})) {
      throw new ModelInitializationError(NOT_MODEL_PLUGIN_EXTENSION);
    }

    return pluginModule[plugin];
  }

  /**
   * Returns plugin model. Checks if plugin is missing then rejects with error.
   * Then checks if `path` is starting with github, then grabs the repository name.
   * Imports module, then checks if it's a class which implements input model interface.
   */
  private async handModel(plugin: string, path: string) {
    if (path === 'builtin') {
      path = pathLib.normalize(`${__dirname}/../models`);
    } else {
      if (path?.startsWith(GITHUB_PATH)) {
        const parts = path.split('/');
        path = parts[parts.length - 1];
      }

      if (!path.includes(NATIVE_MODEL)) {
        console.log(NOT_NATIVE_MODEL);
      }
    }

    return this.importAndVerifyModule(plugin, path);
  }

  /**
   * Registers all plugins from `impl`.`initalize` property.
   */
  public async bulkWriteDown(pluginsToInitalize: ImplInitializeModel[]) {
    for (const plugin of pluginsToInitalize) {
      await this.writeDownSingleModel(plugin);
    }

    return this;
  }

  /**
   * Initializes and registers plugin.
   */
  private async writeDownSingleModel(pluginToInitalize: ImplInitializeModel) {
    const {plugin, path, config, name} = pluginToInitalize;

    if (!plugin) {
      throw new ModelCredentialError(MISSING_CLASSNAME);
    }

    if (!path) {
      throw new ModelCredentialError(MISSING_PATH);
    }

    const Model = await this.handModel(plugin, path);

    const callback = async (options: ModelOptions) => {
      const params = {
        ...config,
        ...options,
      };

      const initalizedModel = await new Model().configure(params);

      return initalizedModel;
    };

    this.initalizedModels = {
      ...this.initalizedModels,
      [name]: callback,
    };

    return this.initalizedModels;
  }

  /**
   * Returns existing plugin by `name`.
   */
  public async getInitializedModel(pluginName: string, config: any) {
    if (this.initalizedModels[pluginName]) {
      return this.initalizedModels[pluginName](config);
    }

    throw new ModelInitializationError(NOT_INITIALIZED_MODEL(pluginName));
  }
}
