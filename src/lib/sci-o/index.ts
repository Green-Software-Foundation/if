import {IImpactModelInterface} from '../interfaces';

import {CONFIG} from '../../config';

import {KeyValuePair} from '../../types/common';

const {MODEL_IDS} = CONFIG;
const {SCI_O} = MODEL_IDS;

export class SciOModel implements IImpactModelInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;

  authenticate(authParams: object): void {
    this.authParams = authParams;
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
      if (!('grid-carbon-intensity' in observation)) {
        throw new Error('observation missing `grid-carbon-intensity`');
      }
      if (!('energy' in observation)) {
        throw new Error('observation missing `energy`');
      }
      this.configure(this.name!, observation);
      const grid_ci = parseFloat(observation['grid-carbon-intensity']);
      const energy = parseFloat(observation['energy']);
      observation['operational-carbon'] = grid_ci * energy;
      return observation;
    });
  }

  async configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IImpactModelInterface> {
    this.staticParams = staticParams;
    this.name = name;
    return this;
  }

  modelIdentifier(): string {
    return SCI_O;
  }
}
