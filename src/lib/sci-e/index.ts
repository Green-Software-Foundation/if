import {IoutputModelInterface} from '../interfaces';

import {CONFIG} from '../../config';

import {KeyValuePair} from '../../types/common';

const {MODEL_IDS} = CONFIG;
const {SCI_E} = MODEL_IDS;

export class SciEModel implements IoutputModelInterface {
  authParams: object | undefined; // Defined for compatibility. Not used in thi smodel.
  name: string | undefined; // name of the data source

  /**
   * Defined for compatibility. Not used in energy-network.
   */
  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   * Configures the sci-e Plugin for IEF
   * @param {string} name name of the resource
   * @param {Object} staticParams static parameters for the resource
   */
  async configure(
    name: string,
    staticParams: object | undefined = undefined
  ): Promise<IoutputModelInterface> {
    this.name = name;

    if (staticParams === undefined) {
      throw new Error('Required Parameters not provided');
    }

    return this;
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
      this.configure(this.name!, input);
      input['energy'] = this.calculateEnergy(input);

      return input;
    });
  }

  /**
   * Returns model identifier
   */
  modelIdentifier(): string {
    return SCI_E;
  }

  /**
   * Calculates the sum of the energy components
   *
   * energy-cpu: cpu energy in kwh
   * energy-memory: energy due to memory usage in kwh
   * energy-network: energy due to network data in kwh
   * timestamp: RFC3339 timestamp string
   *
   * adds energy + e_net + e_mum
   */
  private calculateEnergy(input: KeyValuePair) {
    let e_mem = 0;
    let e_net = 0;
    let e_cpu = 0;

    if (
      !('energy-cpu' in input) &&
      !('energy-memory' in input) &&
      !('energy-network' in input)
    ) {
      throw new Error(
        'Required Parameters not provided: at least one of energy-memory, energy-network or energy must be present in input'
      );
    }

    // If the user gives a negative value it will default to zero.
    if ('energy-cpu' in input && input['energy-cpu'] > 0) {
      e_cpu = input['energy-cpu'];
    }
    if ('energy-memory' in input && input['energy-memory'] > 0) {
      e_mem = input['energy-memory'];
    }
    if ('energy-network' in input && input['energy-network'] > 0) {
      e_net = input['energy-network'];
    }

    return e_cpu + e_net + e_mem;
  }
}
