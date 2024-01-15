import {ModelsUniverse as MockModelUniverse} from '../../../__mocks__/model-universe';

jest.mock('../../../lib/models-universe', () => ({
  __esModule: true,
  ModelsUniverse: MockModelUniverse,
}));

import {Supercomputer} from '../../../lib/supercomputer';
import {ModelsUniverse} from '../../../lib/models-universe';

import {ERRORS} from '../../../util/errors';

import {STRINGS} from '../../../config';

import {Impl} from '../../../types/impl';

const {ImplValidationError} = ERRORS;

const {STRUCTURE_MALFORMED} = STRINGS;

describe('lib/supercomputer: ', () => {
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
          name: 'mock-name',
          kind: 'plugin',
          model: 'MockaviztaModel',
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
          pipeline: ['mock-name'],
          config: {
            'mock-name': {
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
      const node = new Supercomputer(impl, modelsHandbook);

      expect(node).toHaveProperty('compute');
    });
  });

  describe('compute(): ', () => {
    it('should throw error that structure malformed.', async () => {
      const implCopy: Impl = JSON.parse(JSON.stringify(impl));
      const childName = 'front-end';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete implCopy.graph.children[childName].inputs;

      const modelsHandbook = new ModelsUniverse();
      for (const model of impl.initialize.models) {
        await modelsHandbook.writeDown(model);
      }

      const node = new Supercomputer(implCopy, modelsHandbook);

      expect.assertions(1);

      try {
        await node.compute();
      } catch (error) {
        expect(error).toEqual(
          new ImplValidationError(STRUCTURE_MALFORMED(childName))
        );
      }
    });

    it('check if config enrichment is done.', async () => {
      const implCopy: Impl = JSON.parse(JSON.stringify(impl));
      const childName = 'front-end';
      implCopy.graph.children['front-end'].inputs[0].carbon = 10; // for mock

      const modelsHandbook = new ModelsUniverse();
      for (const model of impl.initialize.models) {
        await modelsHandbook.writeDown(model);
      }

      const node = new Supercomputer(implCopy, modelsHandbook);

      const result = await node.compute();

      const nodeConfigKeys = Object.keys(
        result.graph.children[childName].config['mock-name']
      );
      const topOutputs = result.graph.children[childName].outputs;
      const topOutputCount = topOutputs!.length;

      expect.assertions(topOutputCount * 2);

      /** Iterates over all outputs to see if config records where copied to outputs. */
      nodeConfigKeys.forEach(configKey => {
        topOutputs!.forEach(output => {
          const outputKeys = Object.keys(output);

          expect(outputKeys.includes(configKey)).toBeTruthy();
        });
      });
    });

    it('check if config enrichment with nested config is done and overriden.', async () => {
      const implCopy: Impl = JSON.parse(JSON.stringify(impl));
      const childName = 'front-end';
      implCopy.graph.children[childName].inputs[0].carbon = 10; // for mock
      implCopy.graph.children[childName].children = {
        'front-end-1': {
          config: {
            'mock-name': {
              'core-units': 10,
              processor: 'Intel',
            },
          },
          pipeline: ['mock-name'],
          inputs: [
            {
              timestamp: '2023-07-06T00:00',
              duration: 3600,
              'cpu-util': 18.392,
              carbon: 10,
            },
            {
              timestamp: '2023-07-06T00:00',
              duration: 3600,
              'cpu-util': 18.392,
              carbon: 10,
            },
          ],
        },
      };

      const modelsHandbook = new ModelsUniverse();
      for (const model of implCopy.initialize.models) {
        await modelsHandbook.writeDown(model);
      }

      const node = new Supercomputer(implCopy, modelsHandbook);
      const result = await node.compute();

      const topConfigKeys = Object.keys(
        result.graph.children[childName].config['mock-name']
      );
      const nestedConfig =
        implCopy.graph.children[childName].children['front-end-1'].config[
          'mock-name'
        ];
      const topOutputs = result.graph.children[childName].outputs;
      const topOutputCount = topOutputs!.length;
      const nestedOutputs =
        implCopy.graph.children['front-end'].children!['front-end-1'].outputs;

      expect.assertions(topOutputCount * 6);

      topConfigKeys.forEach(topConfigKey => {
        topOutputs!.forEach(output => {
          const outputKeys = Object.keys(output);

          expect(outputKeys.includes(topConfigKey)).toBeTruthy();
        });

        /** Check if nested config is applied over the top one */
        nestedOutputs!.forEach(output => {
          const outputKeys = Object.keys(output);

          if (outputKeys.includes(topConfigKey)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(output[topConfigKey]).toEqual(nestedConfig[topConfigKey]);
          }

          expect(outputKeys.includes(topConfigKey)).toBeTruthy();
        });
      });
    });

    it('check if config enrichment with nested config is done without override.', async () => {
      const implCopy: Impl = JSON.parse(JSON.stringify(impl));
      const childName = 'front-end';
      implCopy.graph.children[childName].inputs[0].carbon = 10; // for mock

      implCopy.graph.children[childName].children = {
        'front-end-1': {
          config: {},
          pipeline: ['mock-name'],
          inputs: [
            {
              timestamp: '2023-07-06T00:00',
              duration: 3600,
              'cpu-util': 18.392,
              carbon: 10,
            },
            {
              timestamp: '2023-07-06T00:00',
              duration: 3600,
              'cpu-util': 18.392,
              carbon: 10,
            },
          ],
        },
      };

      const modelsHandbook = new ModelsUniverse();
      for (const model of implCopy.initialize.models) {
        await modelsHandbook.writeDown(model);
      }

      const node = new Supercomputer(implCopy, modelsHandbook);

      const result = await node.compute();

      const topConfig = result.graph.children[childName].config['mock-name'];
      const topConfigKeys = Object.keys(topConfig);
      const topOutputs = result.graph.children[childName].outputs;
      const topOutputsCount = result.graph.children[childName].outputs!.length;

      expect.assertions(topOutputsCount * 6);

      topConfigKeys.forEach(topConfigKey => {
        topOutputs!.forEach(output => {
          const outputKeys = Object.keys(output);

          expect(outputKeys.includes(topConfigKey)).toBeTruthy();
        });

        /** Check if nested config is applied over the top one */
        implCopy.graph.children['front-end'].children![
          'front-end-1'
        ].outputs!.forEach(output => {
          const outputKeys = Object.keys(output);

          if (outputKeys.includes(topConfigKey)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(output[topConfigKey]).toEqual(topConfig[topConfigKey]);
          }

          expect(outputKeys.includes(topConfigKey)).toBeTruthy();
        });
      });
    });

    it('checks if aggregation is `horizontal`, then applies aggregation.', async () => {
      const implCopy: Impl = JSON.parse(JSON.stringify(impl));
      const childName = 'front-end';
      implCopy.graph.children[childName].inputs[0].carbon = 10;
      implCopy.graph.children[childName].inputs[1].carbon = 10;

      implCopy.aggregation = {
        type: 'horizontal',
        metrics: ['carbon'],
      };

      const modelsHandbook = new ModelsUniverse();
      for (const model of implCopy.initialize.models) {
        await modelsHandbook.writeDown(model);
      }

      const node = new Supercomputer(implCopy, modelsHandbook);

      const result = await node.compute();
      const expectedAggregatedCarbon = implCopy.graph.children[
        childName
      ].inputs.reduce((acc, input) => (acc += input.carbon), 0);

      expect(
        result.graph.children['front-end']['aggregated-outputs']![
          'aggregated-carbon'
        ]
      ).toEqual(expectedAggregatedCarbon);
    });

    it('checks if aggregation is `both`, then applies aggregation.', async () => {
      const implCopy: Impl = JSON.parse(JSON.stringify(impl));
      const childName = 'front-end';
      implCopy.graph.children[childName].inputs[0].carbon = 10;
      implCopy.graph.children[childName].inputs[1].carbon = 10;

      implCopy.aggregation = {
        type: 'both',
        metrics: ['carbon'],
      };

      const modelsHandbook = new ModelsUniverse();
      for (const model of implCopy.initialize.models) {
        await modelsHandbook.writeDown(model);
      }

      const node = new Supercomputer(implCopy, modelsHandbook);

      const result = await node.compute();
      const expectedAggregatedCarbon = implCopy.graph.children[
        childName
      ].inputs.reduce((acc, input) => (acc += input.carbon), 0);

      expect(
        result.graph.children['front-end']['aggregated-outputs']![
          'aggregated-carbon'
        ]
      ).toEqual(expectedAggregatedCarbon);
    });
  });
});
