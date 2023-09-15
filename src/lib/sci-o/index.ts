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

  async calculate(observations: object | object[] | undefined): Promise<any[]> {
    if (!Array.isArray(observations)) {
      throw new Error('observations should be an array');
    }

    const tunedObservations = observations.map((observation: KeyValuePair) => {
      if (!('grid-ci' in observation)) {
        throw new Error('observation missing `grid-ci`');
      }
      if (!('energy' in observation)) {
        throw new Error('observation missing `energy`');
      }
      const grid_ci = parseFloat(observation['grid-ci']);
      const energy = parseFloat(observation['energy']);
      observation['operational-carbon'] = grid_ci * energy;
      return observation;
    });

    return tunedObservations;
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
