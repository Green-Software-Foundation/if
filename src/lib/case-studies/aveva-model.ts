import { IoutputModelInterface } from '../interfaces';

import { CONFIG } from '../../config';

const { MODEL_IDS } = CONFIG;
const { AVEVA } = MODEL_IDS;

export class EAvevaModel implements IoutputModelInterface {
  authParams: object | undefined; // Defined for compatibility. Not used in Aveva.
  name: string | undefined; // name of the data source
  staticParams: object | undefined; // Defined for compatibility. Not used in Aveva.

  /**
   * Defined for compatibility. Not used here.
   */
  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   * Configures the Aveva Plugin for IEF
   * @param {string} name name of the resource
   * @param {Object} staticParams static parameters for the resource
   */
  async configure(
    name: string,
    staticParams: object | undefined = undefined
  ): Promise<IoutputModelInterface> {
    this.name = name;
    this.staticParams = staticParams;

    return this;
  }

  /**
   * Calculate the total emissions for a list of inputs.
   * Each input require:
   * @param {Object[]} inputs
   * @param {number} inputs[].time time to normalize to in hours
   * @param {number} inputs[].pb baseline power
   * @param {number} inputs[].pl measured power
   */
  async execute(inputs: object | object[] | undefined): Promise<any[]> {
    if (inputs === undefined) {
      throw new Error('Required Parameters not provided');
    } else if (!Array.isArray(inputs)) {
      throw new Error('inputs must be an array');
    }

    return inputs.map(input => {
      input['energy-cpu'] =
        ((input['pl'] - input['pb']) * input['time']) / 1000;

      return input;
    });
  }

  /**
   * Returns model identifier
   */
  modelIdentifier() {
    return AVEVA;
  }
}
