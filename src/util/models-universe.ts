import {
  BoaviztaCpuImpactModel,
  BoaviztaCloudImpactModel,
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

import {
  GraphOptions,
  ImplInitializeModel,
  InitalizedModels,
  ModelKind,
} from '../types/models-universe';

/**
 * Models Initialization Lifecycle.
 */
export class ModelsUniverse {
  /**
   * Models list.
   */
  public initalizedModels: InitalizedModels = {};

  /**
   * Gets model class by provided `name` param.
   */
  private handBuiltinModel(name: string) {
    switch (name) {
      case 'boavizta-cpu':
        return BoaviztaCpuImpactModel;
      case 'boavizta-cloud':
        return BoaviztaCloudImpactModel;
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
        throw new Error(`Missing or wrong model: ${name}.`);
    }
  }

  /**
   * Checks if model is instance of `IImpactModelInterface`.
   */
  // private instanceOfModel(object: any): object is IImpactModelInterface {
  //   const boolable =
  //     'modelIdentifier' in object &&
  //     'configure' in object &&
  //     'authenticate' in object &&
  //     'calculate' in object;

  //   return boolable;
  // }

  /**
   * Returns plugin model.
   */
  private async handPluginModel(name: string, classToRequire?: string) {
    const pluginModule = await import(name);

    if (!classToRequire) {
      throw new Error('Model classname is missing.');
    }

    return new pluginModule[classToRequire]();
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
  private async handModelByCriteria(
    name: string,
    kind: ModelKind,
    className?: string
  ) {
    switch (kind) {
      case 'builtin':
        return this.handBuiltinModel(name);
      case 'plugin':
        return this.handPluginModel(name, className);
      case 'shell':
        return this.handShellModel();
    }
  }

  /**
   * Initializes and registers model.
   */
  public writeDown(model: ImplInitializeModel) {
    const {name, kind, config} = model;

    const callback = async (graphOptions: GraphOptions) => {
      const Model = await this.handModelByCriteria(name, kind);

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

    throw new Error(`Model ${modelName} is not initalized yet.`);
  }
}
