import {ModelPluginInterface} from '../types/model-interface';

/**
 * Observatory is responsible for output calculations based on the `inputs` and the `model`.
 */
export class Observatory {
  private inputs: any[];
  private outputs: any[] = [];

  /**
   * Init inputs object.
   */
  constructor(inputs: any) {
    this.inputs = inputs;
  }

  /**
   * Does investigations by given `output` information
   */
  public async doInvestigationsWith(modelInstance: ModelPluginInterface) {
    const reuseCalculation = this.outputs.length ? this.outputs : this.inputs;

    this.outputs = await modelInstance.execute(reuseCalculation);

    return this;
  }

  /**
   * Getter for output data.
   */
  public getOutputs() {
    return this.outputs;
  }
}
