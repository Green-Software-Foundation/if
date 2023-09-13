import {IImpactModelInterface} from '../interfaces';
import {KeyValuePair} from '../../types/boavizta';

export class SciEModel implements IImpactModelInterface {
  // Defined for compatibility. Not used in thi smodel.
  authParams: object | undefined;
  // name of the data source
  name: string | undefined;
  // tdp of the chip being measured

  /**
   * Defined for compatibility. Not used in e-net.
   */
  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   *  Configures the sci-e Plugin for IEF
   *  @param {string} name name of the resource
   *  @param {Object} staticParams static parameters for the resource
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
   * Calculate the total emissions for a list of observations
   *
   * Each Observation require:
   *  @param {Object[]} observations
   *  @param {string} observations[].timestamp RFC3339 timestamp string
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
    return 'sci-e';
  }

  /**
   * Calculates the sum of the energy components
   *
   * e-cpu: cpu energy in kwh
   * e-mem: energy due to memory usage in kwh
   * e-net: energy due to network data in kwh
   * timestamp: RFC3339 timestamp string
   *
   * adds energy + e_net + e_mum
   */
  private calculateEnergy(observation: KeyValuePair) {
    let e_mem = 0;
    let e_net = 0;
    let e_cpu = 0;

    if (
      !('e-cpu' in observation) &&
      !('e-mem' in observation) &&
      !('e-net' in observation)
    ) {
      throw new Error(
        'Required Parameters not provided: at least one of e-mem, e-net or energy must be present in observation'
      );
    }

    // if the user gives a negative value it will default to zero
    if ('e-cpu' in observation && observation['e-cpu'] > 0) {
      e_cpu = observation['e-cpu'];
    }
    if ('e-mem' in observation && observation['e-mem'] > 0) {
      e_mem = observation['e-mem'];
    }
    if ('e-net' in observation && observation['e-net'] > 0) {
      e_net = observation['e-net'];
    }

    return e_cpu + e_net + e_mem;
  }
}
