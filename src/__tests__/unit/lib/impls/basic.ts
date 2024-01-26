import {Impl} from '../../../../types/impl';

export const impl: Impl = {
  name: 'gsf-demo',
  description: 'Hello',
  tags: {
    kind: 'web',
    complexity: 'moderate',
    category: 'cloud',
  },
  initialize: {
    plugins: [
      {
        name: 'mock-name',
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
