import {IImpactModelInterface} from '../interfaces';
import {KeyValuePair} from '../../types/boavizta';

export class EshoppenModel implements IImpactModelInterface {
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
          if (isNaN(observation['e-cpu'])) {
            throw new Error('e-cpu not computable');
          }
          break;
        }
        case 'e-mem': {
          // e-mem-tdp  =  n-hours * n-chip * tdp-mem * tdp-coeff
          observation['e-mem'] =
            observation['n-hours'] *
            observation['n-chips'] *
            observation['tdp-mem'] *
            observation['tdp-coeff'];
          if (isNaN(observation['e-mem'])) {
            throw new Error('e-mem not computable');
          }
          break;
        }
        case 'e-net': {
          // e-net = data-in + data-out * net-energy
          observation['e-net'] =
            (observation['data-in'] + observation['data-out']) *
            observation['net-energy'];
          if (isNaN(observation['e-net'])) {
            throw new Error('e-net not computable');
          }
          break;
        }
        case 'e-sum': {
          // e-sum = e-cpu + e-mem + e-net
          observation['energy'] =
            observation['e-cpu'] + observation['e-mem'] + observation['e-net'];
          if (isNaN(observation['energy'])) {
            throw new Error('energy not computable');
          }
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
    return 'org.gsf.eshoppen';
  }
}

export class EshoppenCpuModel extends EshoppenModel {
  constructor() {
    super();
    this.modelType = 'e-cpu';
  }

  modelIdentifier(): string {
    return 'org.gsf.eshoppen-cpu';
  }
}

export class EshoppenMemModel extends EshoppenModel {
  constructor() {
    super();
    this.modelType = 'e-mem';
  }

  static modelIdentifier(): string {
    return 'org.gsf.eshoppen-mem';
  }
}

export class EshoppenNetModel extends EshoppenModel {
  constructor() {
    super();
    this.modelType = 'e-net';
  }

  modelIdentifier(): string {
    return 'org.gsf.eshoppen-net';
  }
}
