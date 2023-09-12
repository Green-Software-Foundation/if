import {IImpactModelInterface} from '../interfaces';
import {KeyValuePair} from '../../types/boavizta';

export class SciAccenture implements IImpactModelInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  async calculate(
    observations: object | object[] | undefined
  ): Promise<object[]> {
    if (!Array.isArray(observations)) {
      throw new Error('observations should be an array');
    }
    observations.map((observation: KeyValuePair) => {
      observation['sci'] = observation['sci-total'] * 1.05;
      if (isNaN(observation['sci'])) {
        throw new Error('sci not computable');
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
