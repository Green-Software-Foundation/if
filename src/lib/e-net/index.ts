import { IImpactModelInterface } from '../interfaces';
import { KeyValuePair } from '../../types/boavizta';

export class ENetModel implements IImpactModelInterface {
  // Defined for compatibility. Not used in this model.
  authParams: object | undefined;
  // name of the data source
  name: string | undefined;
  // tdp of the chip being measured
  data_in = 0;
  net_energy = 0;

  /**
   * Defined for compatibility. Not used in this model.
   */
  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   *  Configures the e-net Plugin for IEF
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

    if ('net_energy' in staticParams) {
      this.net_energy = staticParams?.net_energy as number;
    }

    return this;
  }

  /**
   * Calculate the total emissions for a list of observations
   *
   * Each Observation require:
   *  @param {Object[]} observations
   *  @param {string} observations[].timestamp RFC3339 timestamp string
   *  @param {number} observations[].mem-util percentage mem usage
   */
  async calculate(observations: object | object[] | undefined): Promise<any[]> {
    if (observations === undefined) {
      throw new Error('Required Parameters not provided');
    } else if (!Array.isArray(observations)) {
      throw new Error('Observations must be an array');
    }
    return observations.map((observation: KeyValuePair) => {
      this.configure(this.name!, observation);
      observation['e_net'] = this.calculateEnergy(observation);
      return observation;
    });
  }

  /**
   * Returns model identifier
   */
  modelIdentifier(): string {
    return 'e-net';
  }

  /**
   * Calculates the energy consumption for a single observation
   * requires
   *
   * data-in: GB of inbound network data
   * data-out: GB of outbound network data
   * timestamp: RFC3339 timestamp string
   *
   * multiplies memory used (GB) by a coefficient (wh/GB) and converts to kwh
   */
  private calculateEnergy(observation: KeyValuePair) {
    if (
      !('data-in' in observation) ||
      !('data-out' in observation) ||
      !('timestamp' in observation)
    ) {
      throw new Error(
        'Required Parameters duration,cpu-util,timestamp not provided for observation'
      );
    }

    const net_energy = this.net_energy;
    //    convert cpu usage to percentage
    const data_in = observation['data-in'];
    const data_out = observation['data-out'];

    return (data_in + data_out) * net_energy;
  }
}
