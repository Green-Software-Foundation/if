import {IImpactModelInterface} from '../interfaces';
import {KeyValuePair} from '../../types/boavizta';

export class Eshoppen implements IImpactModelInterface {
  authParams: object | undefined = undefined;
  modelType: 'e-cpu' | 'e-mem' | 'e-net' | 'e-sum' = 'e-cpu';
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
      switch (this.modelType) {
        case 'e-cpu': {
          //     e-cpu = n-hours * n-chips * tdp * tdp-coeff
          observation['e-cpu'] =
            observation['n-hours'] *
            observation['n-chips'] *
            observation['tdp'] *
            observation['tdp-coeff'];
          break;
        }
        case 'e-mem': {
          // e-mem-tdp  =  n-hours * n-chip * tdp-mem * tdp-coeff
          observation['e-mem'] =
            observation['n-hours'] *
            observation['n-chip'] *
            observation['tdp-mem'] *
            observation['tdp-coeff'];
          break;
        }
        case 'e-net': {
          // e-net = data-in + data-out * net-energy
          observation['e-net'] =
            (observation['data-in'] + observation['data-out']) *
            observation['net-energy'];
          break;
        }
        case 'e-sum': {
          // e-sum = e-cpu + e-mem + e-net
          observation['energy'] =
            observation['e-cpu'] + observation['e-mem'] + observation['e-net'];
          break;
        }
        default: {
          throw new Error('Unknown msft-eshoppen model type');
        }
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
    if (
      staticParams !== undefined &&
      'type' in staticParams &&
      // check that the type is one of the allowed values
      ['e-mem', 'e-cpu', 'e-net', 'e-sum'].includes(
        staticParams['type'] as string
      )
    ) {
      this.modelType = staticParams['type'] as
        | 'e-cpu'
        | 'e-mem'
        | 'e-net'
        | 'e-sum';
      delete staticParams['type'];
    }
    return this;
  }

  modelIdentifier(): string {
    return 'org.gsf.sci-o';
  }
}
