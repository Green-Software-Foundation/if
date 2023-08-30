import {IImpactModelInterface} from '../interfaces';
import Spline from 'typescript-cubic-spline';
import {KeyValuePair} from '../../types/boavizta';

export class TeadsCPUModel implements IImpactModelInterface {
  // Defined for compatibility. Not used in TEADS.
  authParams: object | undefined;
  // name of the data source
  name: string | undefined;
  // tdp of the chip being measured
  tdp = 100;
  // default power curve provided by the Teads Team
  curve: number[] = [0.12, 0.32, 0.75, 1.02];
  // default percentage points
  points: number[] = [0, 10, 50, 100];
  // spline interpolation of the power curve
  spline: Spline = new Spline(this.points, this.curve);

  /**
   * Defined for compatibility. Not used in TEADS.
   */
  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   *  Configures the TEADS Plugin for IEF
   *  @param {string} name name of the resource
   *  @param {Object} staticParams static parameters for the resource
   *  @param {number} staticParams.tdp Thermal Design Power in Watts
   */
  async configure(
    name: string,
    staticParams: object | undefined = undefined
  ): Promise<IImpactModelInterface> {
    this.name = name;

    if (staticParams === undefined) {
      throw new Error('Required Parameters not provided');
    }

    if ('tdp' in staticParams) {
      this.tdp = staticParams?.tdp as number;
    } else {
      throw new Error(
        '`tdp` Thermal Design Power not provided. Can not compute energy.'
      );
    }

    if ('curve' in staticParams) {
      this.curve = staticParams?.curve as number[];
      this.spline = new Spline(this.points, this.curve);
    }

    return this;
  }

  /**
   * Calculate the total emissions for a list of observations
   *
   * Each Observation require:
   *  @param {Object[]} observations  ISO 8601 datetime string
   *  @param {string} observations[].datetime ISO 8601 datetime string
   *  @param {number} observations[].duration observation duration in seconds
   *  @param {number} observations[].cpu percentage cpu usage
   */
  async calculate(
    observations: object | object[] | undefined
  ): Promise<object> {
    if (observations === undefined) {
      throw new Error('Required Parameters not provided');
    }

    const results: KeyValuePair[] = [];
    if (Array.isArray(observations)) {
      observations.forEach((observation: KeyValuePair) => {
        const e = this.calculateEnergy(observation);
        results.push({
          energy: e,
          ...observation,
        });
      });
    }

    return results;
  }

  /**
   * Calculates the energy consumption for a single observation
   * requires
   *
   * duration: duration of the observation in seconds
   * cpu: cpu usage in percentage
   * datetime: ISO 8601 datetime string
   *
   * Uses a spline method on the teads cpu wattage data
   */
  private calculateEnergy(observation: KeyValuePair) {
    if (
      !('duration' in observation) ||
      !('cpu' in observation) ||
      !('datetime' in observation)
    ) {
      throw new Error(
        'Required Parameters duration,cpu,datetime not provided for observation'
      );
    }

    //    duration is in seconds
    const duration = observation['duration'];

    //    convert cpu usage to percentage
    const cpu = observation['cpu'] * 100.0;

    const wattage = this.spline.at(cpu) * this.tdp;
    //  duration is in seconds
    //  wattage is in watts
    //  eg: 30W x 300s = 9000 J
    //  1 Wh = 3600 J
    //  9000 J / 3600 = 2.5 Wh
    //  J / 3600 = Wh
    //  2.5 Wh / 1000 = 0.0025 kWh
    //  Wh / 1000 = kWh
    // (wattage * duration) / (seconds in an hour) / 1000 = kWh
    return (wattage * duration) / 3600 / 1000;
  }

  /**
   * Returns model identifier
   */
  modelIdentifier(): string {
    return 'teads.cpu';
  }
}
