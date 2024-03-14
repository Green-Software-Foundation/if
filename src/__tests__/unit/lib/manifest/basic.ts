import {Manifest} from '../../../../types/manifest';

export const manifest: Manifest = {
  name: 'gsf-demo',
  description: 'Hello',
  tags: {
    kind: 'web',
    complexity: 'moderate',
    category: 'cloud',
  },
  initialize: {
    plugins: {
      'mock-name': {
        model: 'MockaviztaModel',
        path: 'mock-path',
        'global-config': {
          allocation: 'LINEAR',
          verbose: true,
        },
      },
    },
  },
  tree: {
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
};
