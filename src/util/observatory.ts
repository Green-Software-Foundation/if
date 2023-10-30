import {IoutputModelInterface} from '../lib';

/**
 * Observatory calculates outputs based on `inputs` and `model`.
 */
export class Observatory {
  private inputs: any[];
  private output: any[] = [];

  /**
   * Init inputs object.
   */
  constructor(inputs: any) {
    this.inputs = inputs;
  }

  /**
   * Calculates output based on inputs.
   */
  public async doInvestigationsWith(modelInstance: IoutputModelInterface) {
    const reuseCalculation = this.output.length ? this.output : this.inputs;

    const calculatedoutputs = await modelInstance.execute(reuseCalculation);

    const result = this.inputs.map((input: any, index: number) => ({
      ...input,
      ...calculatedoutputs[index],
    }));

    this.output = result;

    return this;
  }

  /**
   * Getter for input data.
   */
  public getinputs() {
    return this.inputs;
  }

  /**
   * Getter for output data.
   */
  public getoutputs() {
    return this.output;
  }
}
