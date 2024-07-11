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

import {loadIfDiffFiles} from '../../../if-diff/lib/load';

import {parseManifestFromStdin} from '../../../if-diff/util/helpers';

import {STRINGS} from '../../../if-diff/config';

import {LoadDiffParams} from '../../../if-diff/types/args';

const {INVALID_SOURCE} = STRINGS;

describe('if-diff/lib/load: ', () => {
  describe('loadIfDiffFiles(): ', () => {
    it('rejects with invalid source error.', async () => {
      const params = {
        sourcePath: '',
        targetPath: '',
      };

      try {
        await loadIfDiffFiles(params);
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe(INVALID_SOURCE);
        }
      }
    });

    it('successfully loads target, and source from stdin.', async () => {
      process.env.readline = 'valid-source';
      const piped = await parseManifestFromStdin();
      const params: LoadDiffParams = {
        targetPath: 'target-path.yml',
        pipedSourceManifest: piped,
      };

      const response = await loadIfDiffFiles(params);
      const expectedSource = {
        name: 'mock-name',
        description: 'mock-description',
      };
      const expectedTarget = 'target-manifest';
      expect(response.rawSourceManifest).toEqual(expectedSource);
      expect(response.rawTargetManifest).toEqual(expectedTarget);
    });

    it('successfully loads target, and source from stdin.', async () => {
      const params = {
        targetPath: 'target-path.yml',
        sourcePath: 'source-path.yml',
      };

      const response = await loadIfDiffFiles(params);
      const expectedSource = 'source-manifest';
      const expectedTarget = 'target-manifest';
      expect(response.rawSourceManifest).toEqual(expectedSource);
      expect(response.rawTargetManifest).toEqual(expectedTarget);
    });
  });
});
