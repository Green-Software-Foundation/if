import {Impl} from '../../../../types/impl';

export const implNested: Impl = {
  name: 'nesting-demo',
  description: null,
  tags: {
    kind: 'web',
    complexity: 'moderate',
    category: 'on-premise',
  },
  initialize: {
    plugins: [
      {
        name: 'mockavizta',
        plugin: 'MockaviztaModel',
        path: 'mock-path',
        config: {
          allocation: 'LINEAR',
          verbose: true,
        },
      },
    ],
  },
  graph: {
    children: {
      'child-0': {
        config: {
          mockavizta: {
            allocation: 'LINEAR',
            verbose: true,
          },
        },
        pipeline: ['mockavizta'],
        children: {
          'child-0-1': {
            children: {
              'child-0-1-1': {
                pipeline: ['mockavizta'],
                inputs: [
                  {
                    timestamp: '2023-07-06T00:00',
                    duration: 10,
                    'cpu-util': 50,
                    'energy-network': 0.000811,
                    carbon: 10,
                  },
                ],
              },
              'child-0-1-2': {
                children: {
                  'child-1-2-1': {
                    pipeline: ['mockavizta'],
                    config: {
                      mockavizta: {
                        allocation: 'mock-allocation',
                        verbose: false,
                      },
                    },
                    inputs: [
                      {
                        timestamp: '2023-07-06T00:00',
                        duration: 10,
                        'cpu-util': 50,
                        'energy-network': 0.000811,
                        carbon: 10,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const implNestedNoConfig: Impl = {
  name: 'nesting-demo',
  description: null,
  tags: {
    kind: 'web',
    complexity: 'moderate',
    category: 'on-premise',
  },
  initialize: {
    plugins: [
      {
        name: 'mockavizta',
        plugin: 'MockaviztaModel',
        path: 'mock-path',
        config: {
          allocation: 'LINEAR',
          verbose: true,
        },
      },
    ],
  },
  graph: {
    children: {
      'child-0': {
        config: {
          mockavizta: {
            allocation: 'LINEAR',
            verbose: true,
          },
        },
        pipeline: ['mockavizta'],
        children: {
          'child-0-1': {
            children: {
              'child-0-1-1': {
                pipeline: ['mockavizta'],
                inputs: [
                  {
                    timestamp: '2023-07-06T00:00',
                    duration: 10,
                    'cpu-util': 50,
                    'energy-network': 0.000811,
                    carbon: 10,
                  },
                ],
              },
              'child-0-1-2': {
                children: {
                  'child-1-2-1': {
                    pipeline: ['mockavizta'],
                    config: {},
                    inputs: [
                      {
                        timestamp: '2023-07-06T00:00',
                        duration: 10,
                        'cpu-util': 50,
                        'energy-network': 0.000811,
                        carbon: 10,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
