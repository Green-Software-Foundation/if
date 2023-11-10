import {ERRORS} from './errors';

import {CONFIG, STRINGS} from '../config';

import {
  GraphOptions,
  ImplInitializeModel,
  InitalizedModels,
} from '../types/models-universe';

const {ModelInitializationError, ModelCredentialError} = ERRORS;

const {GITHUB_PATH} = CONFIG;
const {
  MISSING_CLASSNAME,
  NOT_OUTPUT_MODEL_EXTENSION,
  NOT_INITIALIZED_MODEL,
  MISSING_PATH,
  MODEL_DOESNT_EXIST,
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
   * Checks if model is instance of `IOutputModelInterface`.
   */
  private instanceOfModel(ClassContainer: any) {
    try {
      const testModel = new ClassContainer();

      const boolable = 'configure' in testModel && 'execute' in testModel;

      return boolable;
    } catch (error) {
      throw ModelInitializationError(MODEL_DOESNT_EXIST);
    }
  }

  /**
   * Returns plugin model. Checks if model is missing then rejects with error.
   * Then checks if `path` is starting with github, then grabs the repository name.
   * Imports module, then checks if it's a class which implements input model interface.
   */
  private async handPluginModel(model?: string, path?: string) {
    if (!model) {
      throw new ModelCredentialError(MISSING_CLASSNAME);
    }

    if (!path) {
      throw new ModelCredentialError(MISSING_PATH);
    }

    if (path?.startsWith(GITHUB_PATH)) {
      const parts = path.split('/');
      path = parts[parts.length - 1];
    }

    const pluginModule = await import(path);

    if (this.instanceOfModel(pluginModule[model])) {
      return pluginModule[model];
    }

    throw new Error(NOT_OUTPUT_MODEL_EXTENSION);
  }

  /**
   * Initializes and registers model.
   */
  public writeDown(modelToInitalize: ImplInitializeModel) {
    const {name, config, model, path} = modelToInitalize;

    const callback = async (graphOptions: GraphOptions) => {
      const Model = await this.handPluginModel(model, path);

      const params = {
        ...config,
        ...graphOptions,
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
   * Returns existing model by `name`.
   */
  public async getInitializedModel(modelName: string, config: any) {
    try {
      if (this.initalizedModels[modelName]) {
        return await this.initalizedModels[modelName](config);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new ModelInitializationError(error.message);
      }
    }

    throw new ModelInitializationError(NOT_INITIALIZED_MODEL(modelName));
  }
}
