import {ModelsUniverse as MockModelUniverse} from '../../../__mocks__/model-universe';

jest.mock('../../../util/models-universe', () => ({
  __esModule: true,
  ModelsUniverse: MockModelUniverse,
}));

import {Supercomputer} from '../../../util/supercomputer';
import {ModelsUniverse} from '../../../util/models-universe';

describe('util/supercomputer: ', () => {
  const impl: any = {
    name: 'gsf-demo',
    description: 'Hello',
    tags: {
      kind: 'web',
      complexity: 'moderate',
      category: 'cloud',
    },
    initialize: {
      models: [
        {
          name: 'boavizta-cpu',
          kind: 'builtin',
          config: {
            allocation: 'LINEAR',
            verbose: true,
          },
        },
      ],
    },
    graph: {
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
              'cpu-util': 18.392,
            },
            {
              timestamp: '2023-08-06T00:00',
              duration: 3600,
              'cpu-util': 16,
            },
          ],
        },
      },
    },
  };

  describe('init Supercomputer: ', () => {
    it('initializes object with required properties.', () => {
      const impl: any = {};
      const modelsHandbook = new ModelsUniverse();
      const aterui = new Supercomputer(impl, modelsHandbook);

      expect(aterui).toHaveProperty('compute');
    });
  });

  describe('compute(): ', () => {
    const implWithNestedChildren: any = {
      name: 'ntt-data-on-premise',
      description:
        'https://github.com/Green-Software-Foundation/sci-guide/blob/dev/use-case-submissions/nttdatta-On-Premise-Web-system.md',
      tags: {
        kind: 'web',
        complexity: 'moderate',
        category: 'on-premise',
      },
      initialize: {
        models: [
          {
            name: 'sci-e',
            kind: 'builtin',
            verbose: false,
            path: '',
          },
          {
            name: 'sci-m',
            kind: 'builtin',
            verbose: false,
            path: '',
          },
          {
            name: 'sci-o',
            kind: 'builtin',
            verbose: false,
            path: '',
          },
        ],
      },
      graph: {
        children: {
          'layer-3-switch': {
            pipeline: ['sci-e', 'sci-m', 'sci-o'],
            config: {
              'sci-m': {
                te: 251000,
                tir: 3600,
                el: 126144000,
                rr: 1,
                tor: 1,
              },
              'sci-o': {
                'grid-carbon-intensity': 457,
              },
            },
            inputs: [
              {
                timestamp: '2023-07-06T00:00',
                duration: 3600,
                'five-min-input-rate': 100,
                'five-min-output-rate': 100,
                'grid-carbon-intensity': 457,
                'energy-network': 0.00496,
                requests: 38032740,
              },
            ],
          },
          'layer-2-switch': {
            pipeline: ['sci-e', 'sci-m', 'sci-o'],
            config: {
              'sci-m': {
                te: 251000,
                tir: 3600,
                el: 126144000,
                rr: 1,
                tor: 1,
              },
              'sci-o': {
                grid_ci: 457,
              },
            },
            children: {
              'switch-1': {
                inputs: [
                  {
                    timestamp: '2023-07-06T00:00',
                    duration: 1,
                    'energy-network': 0.000811,
                    'grid-carbon-intensity': 457,
                    requests: 38032740,
                  },
                ],
              },
              'switch-2': {
                inputs: [
                  {
                    timestamp: '2023-07-06T00:00',
                    duration: 1,
                    'energy-network': 0,
                    'grid-carbon-intensity': 457,
                    requests: 38032740,
                  },
                ],
              },
              'switch-3': {
                inputs: [
                  {
                    timestamp: '2023-07-06T00:00',
                    duration: 1,
                    'energy-network': 0.000955,
                    'grid-carbon-intensity': 457,
                    requests: 38032740,
                  },
                ],
              },
              'switch-4': {
                inputs: [
                  {
                    timestamp: '2023-07-06T00:00',
                    duration: 1,
                    'energy-network': 1.14e-8,
                    'grid-carbon-intensity': 457,
                    requests: 38032740,
                  },
                ],
              },
            },
          },
        },
      },
    };

    it('rejects with model is not initialized.', async () => {
      expect.assertions(2);

      const modelsHandbook = new ModelsUniverse();
      const aterui = new Supercomputer(impl, modelsHandbook);

      const expectedMessage = 'Model boavizta-cpu is not initalized yet.';

      try {
        await aterui.compute();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe(expectedMessage);
        }
      }
    });

    it('applies computing to given impl.', async () => {
      expect.assertions(1);

      const modelsHandbook = new ModelsUniverse();
      impl.initialize.models.forEach((model: any) =>
        modelsHandbook.writeDown(model)
      );

      const ateruiComputer = new Supercomputer(impl, modelsHandbook);
      const ompl = await ateruiComputer.compute();

      const children = ompl.graph.children;
      const childrenNames = Object.keys(children);

      expect(ompl.graph.children[childrenNames[0]]).toHaveProperty('outputs');
    });

    it('applies computing to nested children components.', async () => {
      expect.assertions(4);

      const modelsHandbook = new ModelsUniverse();
      implWithNestedChildren.initialize.models.forEach((model: any) =>
        modelsHandbook.writeDown(model)
      );

      const ateruiComputer = new Supercomputer(
        implWithNestedChildren,
        modelsHandbook
      );
      const ompl = await ateruiComputer.compute();

      const children = ompl.graph.children;
      const childrenNames = Object.keys(children);
      const oneWithNested = childrenNames[1];

      const nestedChildren: any = children[oneWithNested].children;

      Object.keys(nestedChildren).forEach((child: any) => {
        expect(nestedChildren[child]).toHaveProperty('outputs');
      });
    });
  });
});
