jest.mock('fs/promises', () => require('../../../__mocks__/fs'));
jest.mock(
  'mockavizta',
  () => ({
    __esmodule: true,
    Mockavizta: () => ({
      execute: (input: PluginParams) => input,
      metadata: {
        kind: 'execute',
      },
    }),
  }),
  {virtual: true}
);

import {load} from '../../../lib/load';

import {PARAMETERS} from '../../../config';

import {PluginParams} from '../../../types/interface';

describe('lib/load: ', () => {
  describe('load(): ', () => {
    it('loads yaml with default parameters.', async () => {
      const inputPath = 'mock.yaml';
      const paramPath = undefined;

      const result = await load(inputPath, paramPath);

      const expectedValue = {
        tree: {
          children: {
            'front-end': {
              pipeline: ['boavizta-cpu'],
              config: {
                'boavizta-cpu': {
                  'core-units': 24,
                  processor: 'Intel® Core™ i7-1185G7',
                },
              },
              inputs: [
                {
                  timestamp: '2023-07-06T00:00',
                  duration: 3600,
                  'cpu/utilization': 18.392,
                },
                {
                  timestamp: '2023-08-06T00:00',
                  duration: 3600,
                  'cpu/utilization': 16,
                },
              ],
            },
          },
        },
        context: {
          name: 'gsf-demo',
          description: 'Hello',
          tags: {
            kind: 'web',
            complexity: 'moderate',
            category: 'cloud',
          },
          initialize: {
            plugins: {
              mockavizta: {
                path: 'mockavizta',
                method: 'Mockavizta',
              },
            },
          },
        },
        parameters: PARAMETERS,
      };

      expect(result).toEqual(expectedValue);
    });

    it('loads yaml with custom parameters.', async () => {
      const inputPath = 'param-mock.yaml';
      const paramPath = 'param-mock.json';

      const result = await load(inputPath, paramPath);

      const expectedParameters = {
        'mock-carbon': {
          description: 'an amount of carbon emitted into the atmosphere',
          unit: 'gCO2e',
          aggregation: 'sum',
        },
        'mock-cpu': {
          description: 'number of cores available',
          unit: 'cores',
          aggregation: 'none',
        },
      };
      const expectedValue = {
        tree: {
          children: {
            'front-end': {
              pipeline: ['boavizta-cpu'],
              config: {
                'boavizta-cpu': {
                  'core-units': 24,
                  processor: 'Intel® Core™ i7-1185G7',
                },
              },
              inputs: [
                {
                  timestamp: '2023-07-06T00:00',
                  duration: 3600,
                  'cpu/utilization': 18.392,
                },
                {
                  timestamp: '2023-08-06T00:00',
                  duration: 3600,
                  'cpu/utilization': 16,
                },
              ],
            },
          },
        },
        context: {
          name: 'gsf-demo',
          description: 'Hello',
          tags: {
            kind: 'web',
            complexity: 'moderate',
            category: 'cloud',
          },
          initialize: {
            plugins: {
              mockavizta: {
                path: 'mockavizta',
                method: 'Mockavizta',
              },
            },
          },
        },
        parameters: expectedParameters,
      };

      expect(result).toEqual(expectedValue);
    });
  });
});
