/* eslint-disable @typescript-eslint/ban-ts-comment */

import {compute} from '../../../if-run/lib/compute';
import {ComputeParams} from '../../../if-run/types/compute';
import {pluginStorage} from '../../../if-run/util/plugin-storage';

describe('lib/compute: ', () => {
  /**
   * Mock plugins.
   */
  const mockExecutePlugin = () => ({
    execute: (inputs: any) =>
      inputs.map((input: any) => {
        input.newField = 'mock-newField';

        return input;
      }),
    metadata: {
      kind: 'execute',
    },
  });
  const mockGroupByPlugin = () => ({
    execute: (inputs: any) => ({children: inputs}),
    metadata: {
      kind: 'groupby',
    },
  });
  /**
   * Compute params.
   */
  const paramsExecute: ComputeParams = {
    // @ts-ignore
    context: {
      name: 'mock-name',
      initialize: {
        plugins: {
          mock: {
            path: 'mockavizta',
            method: 'Mockavizta',
          },
        },
      },
    },
    pluginStorage: pluginStorage().set('mock', mockExecutePlugin()),
  };
  const params: ComputeParams = {
    // @ts-ignore
    context: {
      name: 'mock-name',
      initialize: {
        plugins: {
          mock: {
            path: 'mockavizta',
            method: 'Mockavizta',
          },
        },
      },
    },
    pluginStorage: pluginStorage().set('mock', mockGroupByPlugin()),
  };

  describe('compute(): ', () => {
    it('computes simple tree with execute plugin.', async () => {
      const tree = {
        children: {
          mockChild: {
            pipeline: ['mock'],
            inputs: [
              {timestamp: 'mock-timestamp-1', duration: 10},
              {timestamp: 'mock-timestamp-2', duration: 10},
            ],
          },
        },
      };

      const response = await compute(tree, paramsExecute);
      const expectedResult = mockExecutePlugin().execute(
        tree.children.mockChild.inputs
      );

      expect(response.children.mockChild.outputs).toEqual(expectedResult);
    });

    it('computes simple tree with groupby plugin.', async () => {
      const tree = {
        children: {
          mockChild: {
            pipeline: ['mock'],
            inputs: [
              {timestamp: 'mock-timestamp-1', duration: 10},
              {timestamp: 'mock-timestamp-2', duration: 10},
            ],
          },
        },
      };
      const response = await compute(tree, params);
      const expectedResult = mockGroupByPlugin().execute(
        tree.children.mockChild.inputs
      );

      expect(response.children.mockChild.children).toEqual(expectedResult);
    });

    it('computes simple tree with defaults and execute plugin.', async () => {
      const tree = {
        children: {
          mockChild: {
            pipeline: ['mock'],
            defaults: {
              'cpu/name': 'Intel CPU',
            },
            inputs: [
              {timestamp: 'mock-timestamp-1', duration: 10},
              {timestamp: 'mock-timestamp-2', duration: 10},
            ],
          },
        },
      };
      const response = await compute(tree, paramsExecute);
      const expectedResult = mockExecutePlugin().execute(
        tree.children.mockChild.inputs.map((input: any) => {
          input['cpu/name'] = 'Intel CPU';

          return input;
        })
      );

      expect(response.children.mockChild.outputs).toEqual(expectedResult);
    });

    it('computes nested tree with defaults and execute plugin.', async () => {
      const tree = {
        children: {
          mockChild1: {
            pipeline: ['mock'],
            defaults: {
              'cpu/name': 'Intel CPU',
            },
            inputs: [
              {timestamp: 'mock-timestamp-1', duration: 10},
              {timestamp: 'mock-timestamp-2', duration: 10},
            ],
          },
          mockChild2: {
            children: {
              mockChild21: {
                pipeline: ['mock'],
                defaults: {
                  'cpu/name': 'Intel CPU',
                },
                inputs: [
                  {timestamp: 'mock-timestamp-1', duration: 10},
                  {timestamp: 'mock-timestamp-2', duration: 10},
                ],
              },
            },
          },
        },
      };
      const response = await compute(tree, paramsExecute);

      const mapper = (input: any) => {
        input['cpu/name'] = 'Intel CPU';

        return input;
      };
      const expectedResult1 = mockExecutePlugin().execute(
        tree.children.mockChild1.inputs.map(mapper)
      );
      const expectedResult21 = mockExecutePlugin().execute(
        tree.children.mockChild2.children.mockChild21.inputs.map(mapper)
      );

      expect(response.children.mockChild1.outputs).toEqual(expectedResult1);
      expect(response.children.mockChild2.children.mockChild21.outputs).toEqual(
        expectedResult21
      );
    });

    it('computes simple tree with no defaults and no inputs with execue plugin.', async () => {
      const tree = {
        children: {
          mockChild: {
            pipeline: ['mock'],
            defaults: {},
            inputs: [],
          },
        },
      };
      const response = await compute(tree, paramsExecute);
      const expectedResult: any[] = [];

      expect(response.children.mockChild.outputs).toEqual(expectedResult);
    });

    it('computes simple tree with defaults and no inputs with execue plugin.', async () => {
      const tree = {
        children: {
          mockChild: {
            pipeline: ['mock'],
            defaults: {
              carbon: 10,
            },
            input: [],
          },
        },
      };
      const response = await compute(tree, paramsExecute);
      const expectedResult: any[] = [{carbon: 10, newField: 'mock-newField'}];

      expect(response.children.mockChild.outputs).toEqual(expectedResult);
    });

    it('computes simple tree with node config and execute plugin.', async () => {
      const tree = {
        children: {
          mockChild: {
            pipeline: ['mock'],
            config: {
              'cpu/name': 'Intel CPU',
            },
            inputs: [
              {timestamp: 'mock-timestamp-1', duration: 10},
              {timestamp: 'mock-timestamp-2', duration: 10},
            ],
          },
        },
      };
      const response = await compute(tree, paramsExecute);
      const expectedResult = mockExecutePlugin().execute(
        tree.children.mockChild.inputs
      );

      expect(response.children.mockChild.outputs).toEqual(expectedResult);
    });
  });
});
