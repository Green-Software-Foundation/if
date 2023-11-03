import {
  AzureImporterModel,
  BoaviztaCpuOutputModel,
  BoaviztaCloudOutputModel,
  CloudCarbonFootprint,
  ShellModel,
  SciMModel,
  SciOModel,
  TeadsAWS,
  TeadsCurveModel,
  SciModel,
  EshoppenModel,
  EshoppenCpuModel,
  EshoppenMemModel,
  EshoppenNetModel,
  EMemModel,
  SciAccentureModel,
  EAvevaModel,
  SciEModel,
} from '../lib';

import {CONFIG, STRINGS} from '../config';

import {
  GraphOptions,
  HandModelParams,
  ImplInitializeModel,
  InitalizedModels,
} from '../types/models-universe';

const {GITHUB_PATH} = CONFIG;
const {
  MISSING_CLASSNAME,
  NOT_OUTPUT_MODEL_EXTENSION,
  NOT_INITIALIZED_MODEL,
  WRONG_OR_MISSING_MODEL,
  MISSING_PATH,
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
   * Gets model class by provided `modelName` param.
   */
  private handBuiltinModel(modelName: string) {
    switch (modelName) {
      case 'azure-importer':
        return AzureImporterModel;
      case 'boavizta-cpu':
        return BoaviztaCpuOutputModel;
      case 'boavizta-cloud':
        return BoaviztaCloudOutputModel;
      case 'ccf':
        return CloudCarbonFootprint;
      case 'teads-aws':
        return TeadsAWS;
      case 'teads-curve':
        return TeadsCurveModel;
      case 'sci-e':
        return SciEModel;
      case 'sci-m':
        return SciMModel;
      case 'sci-o':
        return SciOModel;
      case 'sci':
        return SciModel;
      case 'eshoppen':
        return EshoppenModel;
      case 'eshoppen-net':
        return EshoppenNetModel;
      case 'eshoppen-cpu':
        return EshoppenCpuModel;
      case 'eshoppen-mem':
        return EshoppenMemModel;
      case 'sci-accenture':
        return SciAccentureModel;
      case 'emem':
        return EMemModel;
      case 'aveva':
        return EAvevaModel;
      default:
        throw new Error(WRONG_OR_MISSING_MODEL(modelName));
    }
  }

  /**
   * Checks if model is instance of `IOutputModelInterface`.
   */
  private instanceOfModel(ClassContainer: any) {
    const testModel = new ClassContainer();

    const boolable =
      'modelIdentifier' in testModel &&
      'configure' in testModel &&
      'authenticate' in testModel &&
      'execute' in testModel;

    return boolable;
  }

  /**
   * Returns plugin model. Checks if model is missing then rejects with error.
   * Then checks if `path` is starting with github, then grabs the repository name.
   * Imports module, then checks if it's a class which implements input model interface.
   */
  private async handPluginModel(model?: string, path?: string) {
    if (!model) {
      throw new Error(MISSING_CLASSNAME);
    }

    if (!path) {
      throw new Error(MISSING_PATH);
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
   * Returns shell model.
   */
  private handShellModel() {
    return ShellModel;
  }

  /**
   * Gets model based on `name` and `kind` params.
   */
  private async handModelByCriteria(params: HandModelParams) {
    const {name, kind, model, path} = params;

    switch (kind) {
      case 'builtin':
        return this.handBuiltinModel(name);
      case 'plugin':
        return this.handPluginModel(model, path);
      case 'shell':
        return this.handShellModel();
    }
  }

  /**
   * Initializes and registers model.
   */
  public writeDown(model: ImplInitializeModel) {
    const {name, kind, config, model: className, path} = model;

    const callback = async (graphOptions: GraphOptions) => {
      const Model = await this.handModelByCriteria({
        name,
        kind,
        model: className,
        path,
      });

      const params = {
        ...config,
        ...graphOptions,
      };

      const initalizedModel = await new Model().configure('test', params);

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
    if (this.initalizedModels[modelName]) {
      return await this.initalizedModels[modelName](config);
    }

    throw new Error(NOT_INITIALIZED_MODEL(modelName));
  }
}
