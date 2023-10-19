import { IImpactModelInterface } from '../interfaces';

import { CONFIG } from '../../config';

import { KeyValuePair } from '../../types/common';

export { KeyValuePair } from '../../types/common';

const { MODEL_IDS } = CONFIG;
const { ESHOPPEN, ESHOPPEN_CPU, ESHOPPEN_MEM, ESHOPPEN_NET } = MODEL_IDS;

export class EshoppenModel implements IImpactModelInterface {
  authParams: object | undefined = undefined;
  modelType: 'energy-cpu' | 'e-mem' | 'e-net' | 'e-sum' = 'energy-cpu';
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
      switch (this.modelType) {
        case 'energy-cpu': {
          //     energy-cpu = n-hours * n-chips * tdp * tdp-coeff
          observation['energy-cpu'] =
            (observation['n-hours'] *
              observation['n-chips'] *
              observation['tdp'] *
              observation['tdp-coeff']) /
            1000;
          if (isNaN(observation['energy-cpu'])) {
            throw new Error('energy-cpu not computable');
          }

          break;
        }
        case 'e-mem': {
          // e-mem-tdp  =  n-hours * n-chip * tdp-mem * tdp-coeff
          observation['e-mem'] =
            (observation['n-hours'] *
              observation['n-chips'] *
              observation['tdp-mem'] *
              observation['tdp-coeff']) /
            1000;

          if (isNaN(observation['e-mem'])) {
            throw new Error('e-mem not computable');
          }

          break;
        }
        case 'e-net': {
          // e-net = data-in + data-out * net-energy
          observation['e-net'] =
            ((observation['data-in'] + observation['data-out']) *
              observation['net-energy']) /
            1000;

          if (isNaN(observation['e-net'])) {
            throw new Error('e-net not computable');
          }

          break;
        }
        case 'e-sum': {
          // e-sum = energy-cpu + e-mem + e-net
          observation['energy'] =
            observation['energy-cpu'] + observation['e-mem'] + observation['e-net'];

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

    return tunedObservations;
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
      ['e-mem', 'energy-cpu', 'e-net', 'e-sum'].includes(
        staticParams['type'] as string
      )
    ) {
      this.modelType = staticParams['type'] as
        | 'energy-cpu'
        | 'e-mem'
        | 'e-net'
        | 'e-sum';
      delete staticParams['type'];
    }
    return this;
  }

  modelIdentifier(): string {
    return ESHOPPEN;
  }
}

export class EshoppenCpuModel extends EshoppenModel {
  constructor() {
    super();
    this.modelType = 'energy-cpu';
  }

  modelIdentifier(): string {
    return ESHOPPEN_CPU;
  }
}

export class EshoppenMemModel extends EshoppenModel {
  constructor() {
    super();
    this.modelType = 'e-mem';
  }

  modelIdentifier(): string {
    return ESHOPPEN_MEM;
  }
}

export class EshoppenNetModel extends EshoppenModel {
  constructor() {
    super();
    this.modelType = 'e-net';
  }

  modelIdentifier(): string {
    return ESHOPPEN_NET;
  }
}
