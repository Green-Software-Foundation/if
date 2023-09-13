import {IImpactModelInterface} from '../interfaces';
import {KeyValuePair} from '../../types/boavizta';

export class EAvevaModel implements IImpactModelInterface {
  // Defined for compatibility. Not used in Aveva.
  authParams: object | undefined;
  // name of the data source
  name: string | undefined;
  /**
   * Defined for compatibility. Not used here.
   */
  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   *  Configures the Aveva Plugin for IEF
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
   *  @param {number} observations[].time time to normalize to in hours
   *  @param {number} observations[].pb percentage mem usage
   *  @param {number} observations[].pl percentage mem usage
   */
  async calculate(observations: object | object[] | undefined): Promise<any[]> {
    if (observations === undefined) {
      throw new Error('Required Parameters not provided');
    } else if (!Array.isArray(observations)) {
      throw new Error('Observations must be an array');
    }
    return observations.map(observation => {
      this.configure(this.name!, observation);
      observation['e-cpu'] = this.calculateEnergy(observation);
      return observation;
    });
  }
  /**
   * Returns model identifier
   */
  modelIdentifier() {
    return 'e-aveva';
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
  calculateEnergy(observation: KeyValuePair) {
    if (
      !('pl' in observation) ||
      !('pb' in observation) ||
      !('time' in observation)
    ) {
      throw new Error(
        'Required Parameters pl, pb, time not provided for observation'
      );
    }
    const pl = observation['pl'];
    const pb = observation['pb'];
    const time = observation['time'];

    return ((pl - pb) * time) / 1000;
  }
}
