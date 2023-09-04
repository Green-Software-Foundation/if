import {IImpactModelInterface} from '../interfaces';
import {KeyValuePair} from '../../types/boavizta';

export class SciOModel implements IImpactModelInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;
  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  calculate(observations: object | object[] | undefined): Promise<object[]> {
    if (!Array.isArray(observations)) {
      throw new Error('observations should be an array');
    }
    observations.map((observation: KeyValuePair) => {
      if ('grid-ci' in observation && 'energy' in observation) {
        const grid_ci = parseFloat(observation['grid-ci']);
        const energy = parseFloat(observation['energy']);
        observation['operational-emissions'] = grid_ci * energy;
      } else {
        throw new Error(
          'observation missing `grid-ci` or `energy`. Can not compute;'
        );
      }
      return observation;
    });

    return Promise.resolve(observations);
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
    return 'org.gsf.sci-o';
  }
}
