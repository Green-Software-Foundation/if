import {STRINGS} from '../../config';

import {
  ImplInitializeModel,
  InitalizedModels,
} from '../../types/models-universe';
import {ModelPluginInterface} from '../../types/model-interface';

const {NOT_INITIALIZED_MODEL} = STRINGS;

export class MockModel implements ModelPluginInterface {
  configure(): Promise<ModelPluginInterface> {
    return Promise.resolve(this);
  }
  execute(inputs: any): Promise<any[]> {
    if (inputs[0].carbon) {
      return Promise.resolve(inputs);
    }

    return Promise.resolve([{data: 'mock-data'}]);
  }
}

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
  private handBuiltinModel() {
    return MockModel;
  }

  /**
   * Gets model based on `name` and `kind` params.
   */
  private handModelByCriteria() {
    return this.handBuiltinModel();
  }

  /**
   * Initializes and registers model.
   */
  public bulkWriteDown(models: ImplInitializeModel[]) {
    const {name} = models[0];

    const Model = this.handModelByCriteria();

    const callback = async () => {
      const initalizedModel = await new Model().configure();

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
