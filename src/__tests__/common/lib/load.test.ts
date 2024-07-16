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
jest.mock('../../../common/util/helpers', () => ({
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

import {load} from '../../../common/lib/load';

describe('lib/load: ', () => {
  describe('load(): ', () => {
    it('successfully loads yaml.', async () => {
      const inputPath = 'load-default.yml';

      const result = await load(inputPath);

      const expectedValue = {
        rawManifest: 'raw-manifest',
      };

      expect(result).toEqual(expectedValue);
    });
  });
});
