import {IImpactModelInterface} from '../interfaces';
import {KeyValuePair} from '../../types/boavizta';

export class EMemModel implements IImpactModelInterface {
  // Defined for compatibility. Not used in this.
  authParams: object | undefined;
  // name of the data source
  name: string | undefined;
  memoryAllocation = 0;
  memoryEnergy = 0;
  /**
   * Defined for compatibility. Not used.
   */
  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   *  Configures the Plugin for IEF
   *  @param {string} name name of the resource
   *  @param {Object} staticParams static parameters for the resource
   *  @param {number} staticParams.tdp Thermal Design Power in Watts
   *  @param {Interpolation} staticParams.interpolation Interpolation method
   */
  async configure(
    name: string,
    staticParams: object | undefined = undefined
  ): Promise<IImpactModelInterface> {
    this.name = name;

    if (staticParams === undefined) {
      throw new Error('Required Parameters not provided');
    }

    if ('mem-alloc' in staticParams) {
      this.memoryAllocation = staticParams['mem-alloc'] as number;
    }

    if ('mem-energy' in staticParams) {
      this.memoryEnergy = staticParams['mem-energy'] as number;
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
      observation['e-mem'] = this.calculateEnergy(observation);
      return observation;
    });
  }

  /**
   * Returns model identifier
   */
  modelIdentifier(): string {
    return 'e-mem';
  }

  /**
   * Calculates the energy consumption for a single observation
   * requires
   *
   * mem-util: ram usage in percentage
   * timestamp: RFC3339 timestamp string
   *
   * multiplies memory used (GB) by a coefficient (wh/GB) and converts to kwh
   */
  private calculateEnergy(observation: KeyValuePair) {
    if (!('mem-util' in observation) || !('timestamp' in observation)) {
      throw new Error(
        'Required Parameters duration,cpu-util,timestamp not provided for observation'
      );
    }
    if (this.memoryAllocation === 0) {
      throw new Error(
        'Required Parameter: mem-alloc not provided in configure'
      );
    }
    if (this.memoryEnergy === 0) {
      throw new Error(
        'Required Parameter: mem-energy not provided in configure'
      );
    }

    const mem_alloc = this.memoryAllocation;
    //    convert cpu usage to percentage
    const mem_util = observation['mem-util'];
    if (mem_util < 0 || mem_util > 100) {
      throw new Error('cpu usage must be between 0 and 100');
    }

    const mem_energy = this.memoryEnergy;

    return (mem_alloc * (mem_util / 100) * mem_energy) / 1000;
  }
}
