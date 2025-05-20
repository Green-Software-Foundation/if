/* eslint-disable @typescript-eslint/ban-ts-comment */

import {Context} from '../../common/types/manifest';

export const tree = {
  children: {
    'child-1': {
      pipeline: ['teads-curve', 'sum', 'sci-embodied', 'sci-o', 'sci'],
      defaults: {
        'cpu/thermal-design-power': 100,
        'grid/carbon-intensity': 800,
        'device/emissions-embodied': 1533.12,
        'time-reserved': 3600,
        'device/expected-lifespan': 94608000,
        'resources-reserved': 1,
        'resources-total': 8,
      },
      inputs: [
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          'cloud/instance-type': 'A1',
          region: 'uk-west',
          duration: 1,
          'cpu/utilization': 10,
          'network/energy': 10,
          energy: 5,
        },
      ],
      outputs: [
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          'cloud/instance-type': 'A1',
          region: 'uk-west',
          duration: 1,
          'cpu/utilization': 10,
          'network/energy': 10,
          energy: 5,
          'cpu/thermal-design-power': 100,
          'grid/carbon-intensity': 800,
          'device/emissions-embodied': 1533.12,
          'time-reserved': 3600,
          'device/expected-lifespan': 94608000,
          'resources-reserved': 1,
          'resources-total': 8,
          'cpu/energy': 0.000008888888888888888,
          'carbon-plus-energy': 10.000008888888889,
          'embodied-carbon': 0.0000020256215119228817,
          'carbon-operational': 4000,
          carbon: 4000.0000020256216,
          sci: 240000.0001215373,
        },
      ],
      aggregated: undefined,
    },
    'child-2': {
      pipeline: ['teads-curve', 'sum', 'sci-embodied', 'sci-o', 'sci'],
      defaults: {
        'cpu/thermal-design-power': 100,
        'grid/carbon-intensity': 800,
        'device/emissions-embodied': 1533.12,
        'time-reserved': 3600,
        'device/expected-lifespan': 94608000,
        'resources-reserved': 1,
        'resources-total': 8,
      },
      inputs: [
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 1,
          'cpu/utilization': 30,
          'cloud/instance-type': 'A1',
          region: 'uk-west',
          'network/energy': 10,
          energy: 5,
        },
      ],
      outputs: [
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 1,
          'cpu/utilization': 30,
          'cloud/instance-type': 'A1',
          region: 'uk-west',
          'network/energy': 10,
          energy: 5,
          'cpu/thermal-design-power': 100,
          'grid/carbon-intensity': 800,
          'device/emissions-embodied': 1533.12,
          'time-reserved': 3600,
          'device/expected-lifespan': 94608000,
          'resources-reserved': 1,
          'resources-total': 8,
          'cpu/energy': 0.00001650338753387534,
          "carbon-plus-energy'": 10.000016503387533,
          'embodied-carbon': 0.0000020256215119228817,
          'carbon-operational': 4000,
          carbon: 4000.0000020256216,
          sci: 240000.0001215373,
        },
      ],
      aggregated: undefined,
    },
  },
  outputs: [
    {
      carbon: 8000.000004051243,
      timestamp: '2023-12-12T00:00:00.000Z',
      duration: 1,
    },
  ],
  aggregated: {
    carbon: 8000.000004051243,
  },
};

// @ts-ignore
export const context: Context = {
  name: 'demo',
  description: '',
  tags: null,
  aggregation: undefined,
  initialize: {
    plugins: {
      'teads-curve': {
        path: '@grnsft/if-unofficial-plugins',
        method: 'TeadsCurve',
        config: {
          interpolation: 'spline',
        },
      },
      sum: {
        path: '@grnsft/if-plugins',
        method: 'Sum',
        config: {
          'input-parameters': ['cpu/energy', 'network/energy'],
          'output-parameter': "carbon-plus-energy'",
        },
      },
      'sci-embodied': {
        path: 'builtin',
        method: 'SciEmbodied',
      },
      'sci-o': {
        path: '@grnsft/if-plugins',
        method: 'SciO',
      },
      sci: {
        path: '@grnsft/if-plugins',
        method: 'Sci',
        config: {
          'functional-unit': 'requests',
        },
      },
    },
  },
};

export const aggregated = {
  carbon: 4000.0000020256216,
};

export const aggregation = {
  metrics: {carbon: {method: 'sum'}},
  type: 'both',
};
