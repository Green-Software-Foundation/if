import {IImpactModelInterface} from '../interfaces';

import {CONFIG} from '../../config';

import {KeyValuePair} from '../../types/common';

const {MODEL_IDS} = CONFIG;
const {SCI_E} = MODEL_IDS;

export class SciEModel implements IImpactModelInterface {
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
  ): Promise<IImpactModelInterface> {
    this.name = name;

    if (staticParams === undefined) {
      throw new Error('Required Parameters not provided');
    }

    return this;
  }

  /**
   * Calculate the total emissions for a list of observations.
   *
   * Each Observation require:
   * @param {Object[]} observations
   * @param {string} observations[].timestamp RFC3339 timestamp string
   */
  async calculate(observations: object | object[] | undefined): Promise<any[]> {
    if (observations === undefined) {
      throw new Error('Required Parameters not provided');
    } else if (!Array.isArray(observations)) {
      throw new Error('Observations must be an array');
    }

    return observations.map((observation: KeyValuePair) => {
      this.configure(this.name!, observation);
      observation['energy'] = this.calculateEnergy(observation);

      return observation;
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
  private calculateEnergy(observation: KeyValuePair) {
    let e_mem = 0;
    let e_net = 0;
    let e_cpu = 0;

    if (
      !('energy-cpu' in observation) &&
      !('energy-memory' in observation) &&
      !('energy-network' in observation)
    ) {
      throw new Error(
        'Required Parameters not provided: at least one of energy-memory, energy-network or energy must be present in observation'
      );
    }

    // If the user gives a negative value it will default to zero.
    if ('energy-cpu' in observation && observation['energy-cpu'] > 0) {
      e_cpu = observation['energy-cpu'];
    }
    if ('energy-memory' in observation && observation['energy-memory'] > 0) {
      e_mem = observation['energy-memory'];
    }
    if ('energy-network' in observation && observation['energy-network'] > 0) {
      e_net = observation['energy-network'];
    }

    return e_cpu + e_net + e_mem;
  }
}
