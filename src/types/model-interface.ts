import {UnitKeyName} from './units';

export type ModelParams = {
  [K in UnitKeyName]?: any;
};

export interface ModelPluginInterface {
  /**
   * Configures instance with given params.
   */
  configure(params: object | undefined): Promise<ModelPluginInterface>;

  /**
   * Calculates `output` based on given model's `input` and `config`.
   */
  execute(inputs: ModelParams[], config?: object): Promise<ModelParams[]>;
}
