import {IOutputModelInterface} from '../lib';

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
  public async doInvestigationsWith(modelInstance: IOutputModelInterface) {
    const reuseCalculation = this.outputs.length ? this.outputs : this.inputs;

    const calculatedOutputs = await modelInstance.execute(reuseCalculation);

    const result = this.inputs.map((input: any, index: number) => ({
      ...input,
      ...calculatedOutputs[index],
    }));

    this.outputs = result;

    return this;
  }

  /**
   * Getter for output data.
   */
  public getOutputs() {
    return this.outputs;
  }
}
