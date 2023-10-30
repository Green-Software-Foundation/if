import {IoutputModelInterface} from '../interfaces';

import {CONFIG} from '../../config';

import {KeyValuePair} from '../../types/common';

const {MODEL_IDS} = CONFIG;
const {SCI_O} = MODEL_IDS;

export class SciOModel implements IoutputModelInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   * Calculate the total emissions for a list of inputs.
   *
   * Each input require:
   * @param {Object[]} inputs
   * @param {string} inputs[].timestamp RFC3339 timestamp string
   */
  async execute(inputs: object | object[] | undefined): Promise<any[]> {
    if (inputs === undefined) {
      throw new Error('Required Parameters not provided');
    } else if (!Array.isArray(inputs)) {
      throw new Error('inputs must be an array');
    }

    return inputs.map((input: KeyValuePair) => {
      if (!('grid-carbon-intensity' in input)) {
        throw new Error('input missing `grid-carbon-intensity`');
      }
      if (!('energy' in input)) {
        throw new Error('input missing `energy`');
      }
      this.configure(this.name!, input);
      const grid_ci = parseFloat(input['grid-carbon-intensity']);
      const energy = parseFloat(input['energy']);
      input['operational-carbon'] = grid_ci * energy;
      return input;
    });
  }

  async configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IoutputModelInterface> {
    this.staticParams = staticParams;
    this.name = name;
    return this;
  }

  modelIdentifier(): string {
    return SCI_O;
  }
}
