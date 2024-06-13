jest.mock('../../../util/json', () => require('../../../__mocks__/json'));
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
jest.mock('../../../util/helpers', () => ({
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
jest.mock('../../../util/yaml', () => ({
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

import {load, loadIfDiffFiles} from '../../../lib/load';

import {PARAMETERS} from '../../../config';

import {PluginParams} from '../../../types/interface';

import {STRINGS} from '../../../config';
import {parseManifestFromStdin} from '../../../util/helpers';
import {LoadDiffParams} from '../../../types/util/args';

const {INVALID_SOURCE} = STRINGS;

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
