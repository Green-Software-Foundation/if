export type ModelParams = {
  timestamp: string;
  duration: number;
  [key: string]: any;
};

export interface ModelPluginInterface {
  /**
   * Configures instance with given params.
   */
  configure(params: object | undefined): Promise<ModelPluginInterface>;

  /**
   * Calculates `output` based on given model's `input`.
   */
  execute(inputs: ModelParams[]): Promise<ModelParams[]>;
}
