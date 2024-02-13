import {ManifestCommon} from '../../../../types/manifest';
import {Node} from '../../../../types/compute';

export const basicTree: Node = {
  children: {
    'child-1': {
      pipeline: [],
      config: {
        'sci-e': null,
      },
      inputs: [
        {
          timestamp: '2023-08-06T00:00',
          duration: 3600,
          energy: 0.001,
          carbon: 10,
        },
        {
          timestamp: '2023-08-06T05:00',
          duration: 3600,
          energy: 0.001,
          carbon: 10,
        },
        {
          timestamp: '2023-08-06T10:00',
          duration: 3600,
          energy: 0.001,
          carbon: 10,
        },
      ],
    },
    'child-2': {
      pipeline: [],
      config: {
        'sci-e': null,
      },
      inputs: [
        {
          timestamp: '2023-08-06T00:00',
          duration: 3600,
          energy: 0.001,
          carbon: 10,
        },
        {
          timestamp: '2023-08-06T05:00',
          duration: 3600,
          energy: 0.001,
          carbon: 10,
        },
        {
          timestamp: '2023-08-06T10:00',
          duration: 3600,
          energy: 0.001,
          carbon: 10,
        },
      ],
    },
  },
};

export const basicContext: ManifestCommon = {
  name: 'sci-e-demo',
  description: null,
  tags: null,
  aggregation: {
    metrics: ['energy', 'carbon'],
    type: 'both',
  },
  initialize: {
    plugins: {
      'sci-e': {
        model: 'SciE',
        path: '@grnsft/if-models',
      },
    },
  },
};

export const basicResult = {};
