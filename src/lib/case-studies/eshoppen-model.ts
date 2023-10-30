import {IoutputModelInterface} from '../interfaces';

import {CONFIG} from '../../config';

import {KeyValuePair} from '../../types/common';

export {KeyValuePair} from '../../types/common';

const {MODEL_IDS} = CONFIG;
const {ESHOPPEN, ESHOPPEN_CPU, ESHOPPEN_MEM, ESHOPPEN_NET} = MODEL_IDS;

export class EshoppenModel implements IoutputModelInterface {
  authParams: object | undefined = undefined;
  modelType: 'energy-cpu' | 'energy-memory' | 'energy-network' | 'e-sum' =
    'energy-cpu';
  staticParams: object | undefined;
  name: string | undefined;

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  async execute(inputs: object | object[] | undefined): Promise<any[]> {
    if (!Array.isArray(inputs)) {
      throw new Error('inputs should be an array');
    }

    const tunedinputs = inputs.map((input: KeyValuePair) => {
      switch (this.modelType) {
        case 'energy-cpu': {
          //     energy-cpu = n-hours * n-chips * thermal-design-power * thermal-design-power-coeff
          input['energy-cpu'] =
            (input['n-hours'] *
              input['n-chips'] *
              input['thermal-design-power'] *
              input['tdp-coeff']) /
            1000;
          if (isNaN(input['energy-cpu'])) {
            throw new Error('energy-cpu not computable');
          }

          break;
        }
        case 'energy-memory': {
          // energy-memory-tdp  =  n-hours * n-chip * tdp-mem * tdp-coeff
          input['energy-memory'] =
            (input['n-hours'] *
              input['n-chips'] *
              input['tdp-mem'] *
              input['tdp-coeff']) /
            1000;

          if (isNaN(input['energy-memory'])) {
            throw new Error('energy-memory not computable');
          }

          break;
        }
        case 'energy-network': {
          // energy-network = data-in + data-out * net-energy
          input['energy-network'] =
            ((input['data-in'] + input['data-out']) * input['net-energy']) /
            1000;

          if (isNaN(input['energy-network'])) {
            throw new Error('energy-network not computable');
          }

          break;
        }
        case 'e-sum': {
          // e-sum = energy-cpu + energy-memory + energy-network
          input['energy'] =
            input['energy-cpu'] +
            input['energy-memory'] +
            input['energy-network'];

          if (isNaN(input['energy'])) {
            throw new Error('energy not computable');
          }

          break;
        }
        default: {
          throw new Error('Unknown msft-eshoppen model type');
        }
      }

      return input;
    });

    return tunedinputs;
  }

  async configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IoutputModelInterface> {
    this.staticParams = staticParams;
    this.name = name;
    if (
      staticParams !== undefined &&
      'type' in staticParams &&
      // check that the type is one of the allowed values
      ['energy-memory', 'energy-cpu', 'energy-network', 'e-sum'].includes(
        staticParams['type'] as string
      )
    ) {
      this.modelType = staticParams['type'] as
        | 'energy-cpu'
        | 'energy-memory'
        | 'energy-network'
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
    this.modelType = 'energy-memory';
  }

  modelIdentifier(): string {
    return ESHOPPEN_MEM;
  }
}

export class EshoppenNetModel extends EshoppenModel {
  constructor() {
    super();
    this.modelType = 'energy-network';
  }

  modelIdentifier(): string {
    return ESHOPPEN_NET;
  }
}
