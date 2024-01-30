import {ModelsUniverse as MockModelUniverse} from '../../../__mocks__/model-universe';

jest.mock('../../../lib/models-universe', () => ({
  __esModule: true,
  ModelsUniverse: MockModelUniverse,
}));

import {Supercomputer} from '../../../lib/supercomputer';
import {ModelsUniverse} from '../../../lib/models-universe';

import {ERRORS} from '../../../util/errors';

import {STRINGS} from '../../../config';

import {impl} from './impls/basic';
import {implNested, implNestedNoConfig} from './impls/nested';

import {Impl, hasChildren, hasInputs} from '../../../types/impl';

const {ImplValidationError} = ERRORS;

const {STRUCTURE_MALFORMED} = STRINGS;

describe('lib/supercomputer: ', () => {
  describe('init Supercomputer: ', () => {
    it('initializes object with required properties.', () => {
      const impl: any = {};
      const modelsHandbook = new ModelsUniverse();
      const node = new Supercomputer(impl, modelsHandbook);

      expect(node).toHaveProperty('compute');
    });
  });

  describe('compute(): ', () => {
    it('throws error if is structure malformed.', async () => {
      const implCopy: Impl = JSON.parse(JSON.stringify(impl));
      const childName = 'front-end';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete implCopy.graph.children[childName].inputs;

      const modelsHandbook = new ModelsUniverse();
      await modelsHandbook.bulkWriteDown(implCopy.initialize.models);

      expect.assertions(1);

      try {
        await new Supercomputer(implCopy, modelsHandbook).compute();
      } catch (error) {
        expect(error).toEqual(
          new ImplValidationError(STRUCTURE_MALFORMED(childName))
        );
      }
    });

    it('checks if config enrichment is done.', async () => {
      const implCopy: Impl = JSON.parse(JSON.stringify(impl));
      const childName = 'front-end';

      if (hasInputs(implCopy.graph.children['front-end'])) {
        implCopy.graph.children['front-end'].inputs[0].carbon = 10; // for mock
      }

      const modelsHandbook = new ModelsUniverse();
      await modelsHandbook.bulkWriteDown(implCopy.initialize.models);

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

    it('check if config enrichment with nested config is done with override.', async () => {
      const modelsHandbook = new ModelsUniverse();
      await modelsHandbook.bulkWriteDown(implNested.initialize.models);

      const result = await new Supercomputer(
        implNested,
        modelsHandbook
      ).compute();

      const parentNode = result.graph.children['child-0'];
      const parentConfig = parentNode.config['mockavizta'];
      const parentNodeConfigKeys = Object.keys(parentConfig);

      if (hasChildren(result.graph.children['child-0'])) {
        if (
          hasChildren(result.graph.children['child-0'].children['child-0-1'])
        ) {
          const firstNestedChild =
            result.graph.children['child-0'].children['child-0-1'].children[
              'child-0-1-1'
            ];
          const firstNestedChildOutput = firstNestedChild.outputs;

          const secondNestedChild =
            result.graph.children['child-0'].children['child-0-1'].children[
              'child-0-1-2'
            ];

          if (hasChildren(secondNestedChild)) {
            const thirdLevelNestedChild =
              secondNestedChild.children['child-1-2-1'];

            const thirdLevelNestedOutputs = thirdLevelNestedChild.outputs;

            /** Checks if `child-0` config is applied to `child-0-1-1` outputs. */
            parentNodeConfigKeys.forEach((parentConfigKey: string) => {
              firstNestedChildOutput!.forEach(output => {
                const outputKeys = Object.keys(output);

                expect(outputKeys.includes(parentConfigKey)).toBeTruthy();
              });

              /** Checks if `child-1-2-1` config is applied over the `child-0`. */
              thirdLevelNestedOutputs!.forEach(output => {
                const outputKeys = Object.keys(output);

                if (outputKeys.includes(parentConfigKey)) {
                  expect(output[parentConfigKey]).toEqual(
                    thirdLevelNestedChild.config!['mockavizta'][parentConfigKey]
                  );
                }

                expect(outputKeys.includes(parentConfigKey)).toBeTruthy();
              });
            });
          }
        }
      }
    });

    it('check if config enrichment with nested config is done without override.', async () => {
      const modelsHandbook = new ModelsUniverse();
      await modelsHandbook.bulkWriteDown(implNestedNoConfig.initialize.models);

      const result = await new Supercomputer(
        implNestedNoConfig,
        modelsHandbook
      ).compute();

      const parentNode = result.graph.children['child-0'];
      const parentConfig = parentNode.config['mockavizta'];
      const parentNodeConfigKeys = Object.keys(parentConfig);

      if (hasChildren(result.graph.children['child-0'])) {
        if (
          hasChildren(result.graph.children['child-0'].children['child-0-1'])
        ) {
          const firstNestedChild =
            result.graph.children['child-0'].children['child-0-1'].children[
              'child-0-1-1'
            ];
          const firstNestedChildOutput = firstNestedChild.outputs;

          const secondNestedChild =
            result.graph.children['child-0'].children['child-0-1'].children[
              'child-0-1-2'
            ];

          if (hasChildren(secondNestedChild)) {
            const thirdLevelNestedChild =
              secondNestedChild.children['child-1-2-1'];

            const thirdLevelNestedOutputs = thirdLevelNestedChild.outputs;

            /** Checks if `child-0` config is applied to `child-0-1-1` outputs. */
            parentNodeConfigKeys.forEach((parentConfigKey: string) => {
              firstNestedChildOutput!.forEach(output => {
                const outputKeys = Object.keys(output);

                expect(outputKeys.includes(parentConfigKey)).toBeTruthy();
              });

              /** Checks if `child-1-2-1` config is applied with the same `child-0`. */
              thirdLevelNestedOutputs!.forEach(output => {
                const outputKeys = Object.keys(output);

                if (outputKeys.includes(parentConfigKey)) {
                  expect(output[parentConfigKey]).toEqual(
                    parentConfig[parentConfigKey]
                  );
                }

                expect(outputKeys.includes(parentConfigKey)).toBeTruthy();
              });
            });
          }
        }
      }
    });

    it('checks if aggregation is `horizontal`, then applies aggregation.', async () => {
      const implCopy: Impl = JSON.parse(JSON.stringify(impl));
      const childName = 'front-end';

      expect.assertions(1);

      if (hasInputs(implCopy.graph.children[childName])) {
        implCopy.graph.children[childName].inputs[0].carbon = 10;
        implCopy.graph.children[childName].inputs[1].carbon = 10;
        implCopy.aggregation = {
          type: 'horizontal',
          metrics: ['carbon'],
        };

        const modelsHandbook = new ModelsUniverse();
        await modelsHandbook.bulkWriteDown(implCopy.initialize.models);

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
      }
    });

    it('checks if aggregation is `both`, then applies aggregation.', async () => {
      const implCopy: Impl = JSON.parse(JSON.stringify(impl));
      const childName = 'front-end';

      expect.assertions(1);

      if (hasInputs(implCopy.graph.children[childName])) {
        implCopy.graph.children[childName].inputs[0].carbon = 10;
        implCopy.graph.children[childName].inputs[1].carbon = 10;

        implCopy.aggregation = {
          type: 'both',
          metrics: ['carbon'],
        };

        const modelsHandbook = new ModelsUniverse();
        await modelsHandbook.bulkWriteDown(implCopy.initialize.models);

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
      }
    });
  });
});
