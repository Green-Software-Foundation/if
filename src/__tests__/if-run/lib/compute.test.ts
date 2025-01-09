/* eslint-disable @typescript-eslint/ban-ts-comment */
const mockWarn = jest.fn(message => {
  if (process.env.LOGGER === 'true') {
    expect(message).toEqual(
      'You have included node-level config in your manifest to support `params` plugin. IF no longer supports node-level config. `params` plugin should be refactored to accept all its config from config or input data.'
    );
  } else if (process.env.LOGGER === 'empty') {
    expect(message).toEqual(
      'You have included node-level config in your manifest. IF no longer supports node-level config. The manifest should be refactored to accept all its node-level config from config or input data.'
    );
  } else if (process.env.LOGGER === 'invalid') {
    expect(message).toEqual(
      `You're using an old style manifest. Please update for phased execution. More information can be found here: 
https://if.greensoftware.foundation/major-concepts/manifest-file`
    );
  }
});

jest.mock('../../../common/util/logger', () => ({
  logger: {
    warn: mockWarn,
  },
}));

import {ComputeParams} from '../../../if-run/types/compute';
import {pluginStorage} from '../../../if-run/util/plugin-storage';

describe('lib/compute: ', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  /**
   * Mock plugins.
   */
  const mockExecutePlugin = () => ({
    execute: (inputs: any) =>
      inputs.map((input: any) => {
        input.newField = 'mock-newField';

        return input;
      }),
    metadata: {},
  });
  const mockObservePlugin = () => ({
    execute: () => [
      {timestamp: '2024-09-02', duration: 40, 'cpu/utilization': 30},
      {timestamp: '2024-09-03', duration: 60, 'cpu/utilization': 40},
    ],
    metadata: {},
  });
  const mockObservePluginTimeSync = () => ({
    execute: () => [
      {
        timestamp: '2023-12-12T00:00:00.000Z',
        duration: 60,
        'cpu/utilization': 30,
      },
      {
        timestamp: '2023-12-12T00:01:00.000Z',
        duration: 60,
        'cpu/utilization': 40,
      },
    ],
    metadata: {},
  });
  const mockTimeSync = () => ({
    execute: () => [
      {
        timestamp: '2023-12-12T00:00:00.000Z',
        duration: 30,
        'cpu/utilization': 30,
      },
      {
        timestamp: '2023-12-12T00:00:30.000Z',
        duration: 30,
        'cpu/utilization': 30,
      },
      {
        timestamp: '2023-12-12T00:01:00.000Z',
        duration: 30,
        'cpu/utilization': 40,
      },
      {
        timestamp: '2023-12-12T00:01:30.000Z',
        duration: 30,
        'cpu/utilization': 40,
      },
    ],
    metadata: {},
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
    pluginStorage: pluginStorage()
      .set('mock', mockExecutePlugin())
      .set('mock-observe', mockObservePlugin())
      .set('mock-observe-time-sync', mockObservePluginTimeSync())
      .set('time-sync', mockTimeSync()),
  };

  const observeParamsExecute: ComputeParams = {
    // @ts-ignore
    observe: {},
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
    pluginStorage: pluginStorage()
      .set('mock', mockExecutePlugin())
      .set('mock-observe', mockObservePlugin())
      .set('mock-observe-time-sync', mockObservePluginTimeSync())
      .set('time-sync', mockTimeSync()),
  };
  const paramsExecuteWithAppend = {...paramsExecute, append: true};

  describe('compute(): ', () => {
    it('computes simple tree with execute plugin.', async () => {
      const {compute} = require('../../../if-run/lib/compute');
      const tree = {
        children: {
          mockChild: {
            pipeline: {compute: ['mock']},
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

    it('computes simple tree with regroup on inputs only (no compute).', async () => {
      const {compute} = require('../../../if-run/lib/compute');
      const tree = {
        children: {
          mockChild: {
            pipeline: {regroup: ['region']},
            inputs: [
              {timestamp: 'mock-timestamp-1', region: 'uk-west'},
              {timestamp: 'mock-timestamp-2', region: 'uk-east'},
              {timestamp: 'mock-timestamp-3', region: 'uk-east'},
            ],
          },
        },
      };
      const response = await compute(tree, paramsExecute);
      const expectedResponse = {
        'uk-west': {
          inputs: [{region: 'uk-west', timestamp: 'mock-timestamp-1'}],
        },
        'uk-east': {
          inputs: [
            {region: 'uk-east', timestamp: 'mock-timestamp-2'},
            {region: 'uk-east', timestamp: 'mock-timestamp-3'},
          ],
        },
      };

      expect(response.children.mockChild.children).toEqual(expectedResponse);
    });

    it('skips regrouping on already regrouped data.', async () => {
      const {compute} = require('../../../if-run/lib/compute');
      const expectedResponse = {
        'uk-west': {
          inputs: [{region: 'uk-west', timestamp: 'mock-timestamp-1'}],
        },
        'uk-east': {
          inputs: [
            {region: 'uk-east', timestamp: 'mock-timestamp-2'},
            {region: 'uk-east', timestamp: 'mock-timestamp-3'},
          ],
        },
      };
      const tree = {
        children: {
          mockChild: {
            pipeline: {regroup: ['region']},
            children: expectedResponse,
          },
        },
      };
      const response = await compute(tree, paramsExecute);

      expect(response.children.mockChild.children).toEqual(expectedResponse);
    });

    it('computes simple tree with regroup, grouping inputs and outputs.', async () => {
      const {compute} = require('../../../if-run/lib/compute');
      const tree = {
        children: {
          mockChild: {
            pipeline: {regroup: ['region'], compute: ['mock']},
            inputs: [
              {timestamp: 'mock-timestamp-1', region: 'uk-west'},
              {timestamp: 'mock-timestamp-2', region: 'uk-east'},
              {timestamp: 'mock-timestamp-3', region: 'uk-east'},
            ],
          },
        },
      };
      const response = await compute(tree, paramsExecute);
      const expectedResponse = {
        'uk-west': {
          inputs: [{region: 'uk-west', timestamp: 'mock-timestamp-1'}],
          outputs: [
            {
              region: 'uk-west',
              timestamp: 'mock-timestamp-1',
              newField: 'mock-newField',
            },
          ],
        },
        'uk-east': {
          inputs: [
            {region: 'uk-east', timestamp: 'mock-timestamp-2'},
            {region: 'uk-east', timestamp: 'mock-timestamp-3'},
          ],
          outputs: [
            {
              region: 'uk-east',
              timestamp: 'mock-timestamp-2',
              newField: 'mock-newField',
            },
            {
              region: 'uk-east',
              timestamp: 'mock-timestamp-3',
              newField: 'mock-newField',
            },
          ],
        },
      };
      expect(response.children.mockChild.children).toEqual(expectedResponse);
    });

    it('computes simple tree with defaults and execute plugin.', async () => {
      const {compute} = require('../../../if-run/lib/compute');
      const tree = {
        children: {
          mockChild: {
            pipeline: {compute: ['mock']},
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
      const {compute} = require('../../../if-run/lib/compute');
      const tree = {
        children: {
          mockChild1: {
            pipeline: {compute: ['mock']},
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
                pipeline: {compute: ['mock']},
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

    it('computes simple tree with no defaults and no inputs with execute plugin.', async () => {
      const {compute} = require('../../../if-run/lib/compute');
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

      expect(response.children.mockChild.outputs).toBeUndefined();
    });

    it('computes simple tree with defaults and no inputs with execute plugin.', async () => {
      const {compute} = require('../../../if-run/lib/compute');
      const tree = {
        children: {
          mockChild: {
            pipeline: {
              compute: ['mock'],
            },
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

    it('computes simple tree with append, preserving existing outputs.', async () => {
      const {compute} = require('../../../if-run/lib/compute');
      const tree = {
        children: {
          mockChild: {
            pipeline: {compute: ['mock']},
            inputs: [
              {timestamp: 'mock-timestamp-1', region: 'eu-west'},
              {timestamp: 'mock-timestamp-2', region: 'eu-west'},
            ],
            outputs: [
              {
                timestamp: 'mock-timestamp-preexisting-1',
                newField: 'mock-newField',
                region: 'eu-west',
              },
              {
                timestamp: 'mock-timestamp-preexisting-2',
                newField: 'mock-newField',
                region: 'eu-west',
              },
            ],
          },
        },
      };
      const response = await compute(tree, paramsExecuteWithAppend);
      const expectedResult = [
        ...tree.children.mockChild.outputs,
        ...mockExecutePlugin().execute(tree.children.mockChild.inputs),
      ];

      expect.assertions(2);
      expect(response.children.mockChild.outputs).toHaveLength(4);
      expect(response.children.mockChild.outputs).toEqual(expectedResult);
    });

    it('computes simple tree with append when outputs is null.', async () => {
      const {compute} = require('../../../if-run/lib/compute');
      const tree = {
        children: {
          mockChild: {
            pipeline: {compute: ['mock']},
            inputs: [
              {timestamp: 'mock-timestamp-1', region: 'eu-west'},
              {timestamp: 'mock-timestamp-2', region: 'eu-west'},
            ],
            outputs: undefined,
          },
        },
      };
      const response = await compute(tree, paramsExecuteWithAppend);
      const expectedResult = mockExecutePlugin().execute(
        tree.children.mockChild.inputs
      );

      expect.assertions(2);
      expect(response.children.mockChild.outputs).toHaveLength(2);
      expect(response.children.mockChild.outputs).toEqual(expectedResult);
    });
  });

  it('computes simple tree with regroup and append, with existing outputs preserved and regrouped without re-computing.', async () => {
    const {compute} = require('../../../if-run/lib/compute');
    const tree = {
      children: {
        mockChild: {
          pipeline: {regroup: ['region'], compute: ['mock']},
          inputs: [{timestamp: 'mock-timestamp-1', region: 'uk-east'}],
          outputs: [
            {timestamp: 'mock-timestamp-preexisting-1', region: 'uk-east'},
          ],
        },
      },
    };
    const response = await compute(tree, paramsExecuteWithAppend);
    const expectedResponse = {
      'uk-east': {
        inputs: [{region: 'uk-east', timestamp: 'mock-timestamp-1'}],
        outputs: [
          {
            region: 'uk-east',
            timestamp: 'mock-timestamp-preexisting-1',
          },
          {
            region: 'uk-east',
            timestamp: 'mock-timestamp-1',
            newField: 'mock-newField',
          },
        ],
      },
    };
    expect(response.children.mockChild.children).toEqual(expectedResponse);
  });

  it('computes simple tree with regroup and append, with existing outputs preserved and without new outputs.', async () => {
    const {compute} = require('../../../if-run/lib/compute');
    const tree = {
      children: {
        mockChild: {
          pipeline: {regroup: ['region'], compute: ['mock']},
          inputs: [{timestamp: 'mock-timestamp-1', region: 'uk-east'}],
        },
      },
    };
    const response = await compute(tree, paramsExecuteWithAppend);
    const expectedResponse = {
      'uk-east': {
        inputs: [{region: 'uk-east', timestamp: 'mock-timestamp-1'}],
        outputs: [
          {
            newField: 'mock-newField',
            region: 'uk-east',
            timestamp: 'mock-timestamp-1',
          },
        ],
      },
    };

    expect(response.children.mockChild.children).toEqual(expectedResponse);
  });

  it('computes simple tree with regroup and no append, with existing outputs that are removed.', async () => {
    const {compute} = require('../../../if-run/lib/compute');
    const tree = {
      children: {
        mockChild: {
          pipeline: {regroup: ['region'], compute: ['mock']},
          inputs: [{timestamp: 'mock-timestamp-1', region: 'uk-east'}],
          outputs: [
            {timestamp: 'mock-timestamp-preexisting-1', region: 'uk-east'},
          ],
        },
      },
    };
    const response = await compute(tree, paramsExecute);
    const expectedResponse = {
      'uk-east': {
        inputs: [{region: 'uk-east', timestamp: 'mock-timestamp-1'}],
        outputs: [
          {
            region: 'uk-east',
            timestamp: 'mock-timestamp-1',
            newField: 'mock-newField',
          },
        ],
      },
    };
    expect(response.children.mockChild.children).toEqual(expectedResponse);
  });

  it('computes simple tree with observe plugin.', async () => {
    const {compute} = require('../../../if-run/lib/compute');
    const tree = {
      children: {
        mockChild: {
          pipeline: {observe: ['mock-observe']},
        },
      },
    };

    const response = await compute(tree, paramsExecute);
    const expectedResult = [
      {timestamp: '2024-09-02', duration: 40, 'cpu/utilization': 30},
      {timestamp: '2024-09-03', duration: 60, 'cpu/utilization': 40},
    ];

    expect.assertions(1);
    expect(response.children.mockChild.inputs).toEqual(expectedResult);
  });

  it('computes simple tree with observe plugin.', async () => {
    const {compute} = require('../../../if-run/lib/compute');
    const tree = {
      children: {
        mockChild: {
          pipeline: {observe: ['mock-observe']},
        },
      },
    };

    const response = await compute(tree, paramsExecute);
    const expectedResult = [
      {timestamp: '2024-09-02', duration: 40, 'cpu/utilization': 30},
      {timestamp: '2024-09-03', duration: 60, 'cpu/utilization': 40},
    ];

    expect.assertions(1);
    expect(response.children.mockChild.inputs).toEqual(expectedResult);
  });

  it('observes simple tree with observe plugin.', async () => {
    const {compute} = require('../../../if-run/lib/compute');
    const tree = {
      children: {
        mockChild: {
          pipeline: {observe: ['mock-observe']},
        },
      },
    };

    const response = await compute(tree, observeParamsExecute);
    const expectedResult = [
      {timestamp: '2024-09-02', duration: 40, 'cpu/utilization': 30},
      {timestamp: '2024-09-03', duration: 60, 'cpu/utilization': 40},
    ];

    expect.assertions(1);
    expect(response.children.mockChild.inputs).toEqual(expectedResult);
  });

  it('observes simple tree with config.', async () => {
    const {compute} = require('../../../if-run/lib/compute');
    const tree = {
      children: {
        mockChild: {
          pipeline: {observe: ['mock-observe']},
          config: {},
        },
      },
    };

    const response = await compute(tree, observeParamsExecute);
    const expectedResult = [
      {timestamp: '2024-09-02', duration: 40, 'cpu/utilization': 30},
      {timestamp: '2024-09-03', duration: 60, 'cpu/utilization': 40},
    ];

    expect.assertions(1);
    expect(response.children.mockChild.inputs).toEqual(expectedResult);
  });

  it('warns when pipeline is null.', async () => {
    const {compute} = require('../../../if-run/lib/compute');
    process.env.LOGGER = 'invalid';
    const tree = {
      children: {
        mockChild: {
          pipeline: null,
        },
      },
    };
    paramsExecute.context.explainer = false;
    const response = await compute(tree, paramsExecute);

    expect.assertions(2);
    expect(response.children.mockChild.inputs).toEqual(undefined);

    process.env.LOGGER = undefined;
  });

  it('warns when pipeline is an empty object.', async () => {
    const {compute} = require('../../../if-run/lib/compute');
    const tree = {
      children: {
        mockChild: {
          pipeline: {},
        },
      },
    };
    paramsExecute.context.explainer = false;
    const response = await compute(tree, paramsExecute);

    expect.assertions(1);
    expect(response.children.mockChild.inputs).toEqual(undefined);
  });

  it('warns when config is provided in the tree.', async () => {
    const {compute} = require('../../../if-run/lib/compute');
    process.env.LOGGER = 'true';
    const tree = {
      children: {
        mockChild: {
          pipeline: {compute: ['mock']},
          config: {params: 5},
          inputs: [
            {timestamp: 'mock-timestamp-1', duration: 10},
            {timestamp: 'mock-timestamp-2', duration: 10},
          ],
        },
      },
    };
    paramsExecute.context.explainer = false;
    const response = await compute(tree, paramsExecute);
    const expectedResult = mockExecutePlugin().execute(
      tree.children.mockChild.inputs
    );

    expect.assertions(2);

    expect(response.children.mockChild.outputs).toEqual(expectedResult);
    process.env.LOGGER = undefined;
  });

  it('warns when config is provided in the tree and it is null.', async () => {
    const {compute} = require('../../../if-run/lib/compute');
    process.env.LOGGER = 'empty';
    const tree = {
      children: {
        mockChild: {
          pipeline: {compute: ['mock']},
          config: null,
          inputs: [
            {timestamp: 'mock-timestamp-1', duration: 10},
            {timestamp: 'mock-timestamp-2', duration: 10},
          ],
        },
      },
    };
    paramsExecute.context.explainer = false;
    const response = await compute(tree, paramsExecute);
    const expectedResult = mockExecutePlugin().execute(
      tree.children.mockChild.inputs
    );

    expect.assertions(2);

    expect(response.children.mockChild.outputs).toEqual(expectedResult);
    process.env.LOGGER = undefined;
  });

  it('observes simple tree with execute plugin and explain property.', async () => {
    const {compute} = require('../../../if-run/lib/compute');
    const explainer = require('../../../if-run/lib/explain');
    const tree = {
      children: {
        mockChild: {
          pipeline: {observe: ['mock-observe']},
        },
      },
    };

    paramsExecute.context.explainer = true;

    const explainerSpy = jest.spyOn(explainer, 'addExplainData');

    const response = await compute(tree, paramsExecute);
    const expectedResult = [
      {timestamp: '2024-09-02', duration: 40, 'cpu/utilization': 30},
      {timestamp: '2024-09-03', duration: 60, 'cpu/utilization': 40},
    ];

    expect.assertions(2);

    expect(response.children.mockChild.inputs).toEqual(expectedResult);
    expect(explainerSpy).toHaveBeenCalledWith({
      metadata: {},
      pluginName: 'mock-observe',
    });
  });

  it('computes simple tree with execute plugin and explain property.', async () => {
    const {compute} = require('../../../if-run/lib/compute');
    const tree = {
      children: {
        mockChild: {
          pipeline: {compute: ['mock']},
          inputs: [
            {timestamp: 'mock-timestamp-1', duration: 10},
            {timestamp: 'mock-timestamp-2', duration: 10},
          ],
        },
      },
    };

    paramsExecute.context.explainer = true;

    const response = await compute(tree, paramsExecute);
    const expectedResult = mockExecutePlugin().execute(
      tree.children.mockChild.inputs
    );

    expect(response.children.mockChild.outputs).toEqual(expectedResult);
  });
});
