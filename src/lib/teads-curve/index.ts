import Spline from 'typescript-cubic-spline';

import {IOutputModelInterface} from '../interfaces';

import {CONFIG} from '../../config';

import {KeyValuePair, Interpolation} from '../../types/common';

const {MODEL_IDS} = CONFIG;
const {TEADS_CURVE} = MODEL_IDS;

export class TeadsCurveModel implements IOutputModelInterface {
  authParams: object | undefined; // Defined for compatibility. Not used in TEADS.
  name: string | undefined; // Name of the data source.
  tdp = 0; // `tdp` of the chip being measured.
  curve: number[] = [0.12, 0.32, 0.75, 1.02]; // Default power curve provided by the Teads Team.
  points: number[] = [0, 10, 50, 100]; // Default percentage points.
  spline: any = new Spline(this.points, this.curve); // Spline interpolation of the power curve.
  interpolation: Interpolation = Interpolation.SPLINE; // Interpolation method.

  /**
   * Defined for compatibility. Not used in TEADS.
   */
  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   * Configures the TEADS Plugin for IEF
   * @param {string} name name of the resource
   * @param {Object} staticParams static parameters for the resource
   * @param {number} staticParams.tdp Thermal Design Power in Watts
   * @param {Interpolation} staticParams.interpolation Interpolation method
   */
  async configure(
    name: string,
    staticParams: object | undefined = undefined
  ): Promise<IOutputModelInterface> {
    this.name = name;

    if (staticParams === undefined) {
      throw new Error('Required Parameters not provided');
    }

    if ('thermal-design-power' in staticParams) {
      this.tdp = staticParams['thermal-design-power'] as number;
    }

    // if ('curve' in staticParams && 'points' in staticParams) {
    //   this.curve = staticParams?.curve as number[];
    //   this.points = staticParams?.points as number[];
    //   if (this.curve.length !== this.points.length) {
    //     throw new Error(
    //       'Number of points and curve values must be the same length'
    //     );
    //   }
    //   this.spline = new Spline(this.points, this.curve);
    // }

    if ('interpolation' in staticParams) {
      this.interpolation = staticParams?.interpolation as Interpolation;
    }

    return this;
  }

  /**
   * Calculate the total emissions for a list of inputs
   *
   * Each input require:
   * @param {Object[]} inputs
   * @param {string} inputs[].timestamp RFC3339 timestamp string
   * @param {number} inputs[].duration input duration in seconds
   * @param {number} inputs[].cpu-util percentage cpu usage
   */
  async execute(inputs: object | object[] | undefined): Promise<any[]> {
    if (inputs === undefined) {
      throw new Error('Required Parameters not provided');
    } else if (!Array.isArray(inputs)) {
      throw new Error('inputs must be an array');
    }
    return inputs.map((input: KeyValuePair) => {
      this.configure(this.name!, input);
      input['energy-cpu'] = this.calculateEnergy(input);
      return input;
    });
  }

  /**
   * Returns model identifier
   */
  modelIdentifier(): string {
    return TEADS_CURVE;
  }

  /**
   * Calculates the energy consumption for a single input
   * requires
   *
   * duration: duration of the input in seconds
   * cpu-util: cpu usage in percentage
   * timestamp: RFC3339 timestamp string
   *
   * Uses a spline method on the teads cpu wattage data
   */
  private calculateEnergy(input: KeyValuePair) {
    if (
      !('duration' in input) ||
      !('cpu-util' in input) ||
      !('timestamp' in input)
    ) {
      throw new Error(
        'Required Parameters duration,cpu-util,timestamp not provided for input'
      );
    }

    //    duration is in seconds
    const duration = input['duration'];

    //    convert cpu usage to percentage
    const cpu = input['cpu-util'];
    if (cpu < 0 || cpu > 100) {
      throw new Error('cpu usage must be between 0 and 100');
    }

    let tdp = this.tdp;

    if ('thermal-design-power' in input) {
      tdp = input['thermal-design-power'] as number;
    }
    if (tdp === 0) {
      throw new Error(
        '`thermal-design-power` not provided. Can not compute energy.'
      );
    }

    let wattage = 0.0;
    if (this.interpolation === Interpolation.SPLINE) {
      wattage = this.spline.at(cpu) * tdp;
    } else if (this.interpolation === Interpolation.LINEAR) {
      const x = this.points;
      const y = this.curve;
      // base rate is from which level of cpu linear interpolation is applied at
      let base_rate = 0;
      let base_cpu = 0;
      let ratio = 0;
      // find the base rate and ratio
      for (let i = 0; i < x.length; i++) {
        if (cpu === x[i]) {
          base_rate = y[i];
          base_cpu = x[i];
          break;
        } else if (cpu > x[i] && cpu < x[i + 1]) {
          base_rate = y[i];
          base_cpu = x[i];
          ratio = (y[i + 1] - y[i]) / (x[i + 1] - x[i]);
          break;
        }
      }
      // sum of base_rate + (cpu - base_cpu) * ratio = total rate of cpu usage
      // total rate * tdp = wattage
      wattage = (base_rate + (cpu - base_cpu) * ratio) * tdp;
    }
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
}

/**
 * For JSII.
 */
export {KeyValuePair, Interpolation} from '../../types/common';
