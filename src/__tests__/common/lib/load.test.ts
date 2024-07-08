jest.mock('../../../if-run/util/json', () =>
  require('../../../__mocks__/json')
);
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
jest.mock('../../../if-diff/util/helpers', () => ({
  parseManifestFromStdin: () => {
    if (process.env.readline === 'valid-source') {
      return `
name: 'mock-name'
description: 'mock-description'
`;
    }
    return '';
  },
}));
jest.mock('../../../common/util/yaml', () => ({
  openYamlFileAsObject: (path: string) => {
    switch (path) {
      case 'load-default.yml':
        return 'raw-manifest';
      case 'source-path.yml':
        return 'source-manifest';
      case 'target-path.yml':
        return 'target-manifest';
      default:
        return '';
    }
  },
}));

import {PluginParams} from '@grnsft/if-core/types';

import {PARAMETERS} from '../../../if-run/config';
import {load} from '../../../common/lib/load';

describe('lib/load: ', () => {
  describe('load(): ', () => {
    it('loads yaml with default parameters.', async () => {
      const inputPath = 'load-default.yml';
      const paramPath = undefined;

      const result = await load(inputPath, paramPath);

      const expectedValue = {
        rawManifest: 'raw-manifest',
        parameters: PARAMETERS,
      };

      expect(result).toEqual(expectedValue);
    });

    it('loads yaml with custom parameters.', async () => {
      const inputPath = 'load-default.yml';
      const paramPath = 'param-mock.json';

      const result = await load(inputPath, paramPath);

      const expectedValue = {
        rawManifest: 'raw-manifest',
        parameters: {
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
        },
      };

      expect(result).toEqual(expectedValue);
    });
  });
});
