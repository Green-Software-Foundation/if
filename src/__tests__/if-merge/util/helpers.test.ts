import {mergeManifests} from '../../../if-merge/util/helpers';
import {getFileName, getYamlFiles} from '../../../common/util/fs';

import {load} from '../../../common/lib/load';

jest.mock('../../../common/util/fs', () => ({
  getYamlFiles: jest.fn(),
  getFileName: jest.fn(),
  load: jest.fn(),
}));

jest.mock('../../../common/lib/load', () => ({
  load: jest.fn(),
}));

jest.mock('../../../if-run/builtins/export-yaml', () => ({
  ExportYaml: jest.fn().mockImplementation(() => ({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    execute: (tree, context, outputPath) => {
      const expectedContext = {
        name: 'if-merge',
        description: 'merged manifest',
        tags: {},
        initialize: {
          plugins: {
            multiply: {
              path: 'builtin',
              method: 'Multiply',
              'global-config': {
                'input-parameters': ['cpu/utilization', 'duration'],
                'output-parameter': 'cpu-times-duration',
              },
            },
          },
        },
      };

      if (process.env.CONTEXT !== 'default-name-description') {
        expectedContext.name = 'mock name';
        expectedContext.description = 'mock description';
        expect(outputPath).toBe('mock-outputPath');
      } else {
        expect(outputPath).toBe('mock-outputPath');
      }

      expect(context).toEqual(expectedContext);
    },
  })),
}));

describe('if-merge/util/helpers: ', () => {
  const consopleSpy = jest.spyOn(global.console, 'log');

  beforeEach(() => {
    consopleSpy.mockReset();
  });

  describe('mergeManifests(): ', () => {
    const mockCommandArgs = {
      manifests: ['manifest1.yaml', 'manifest2.yaml'],
      output: 'mock-outputPath',
      name: 'mock name',
      description: 'mock description',
    };

    const tree = {
      children: {
        'child-0': {
          defaults: {
            'cpu/thermal-design-power': 100,
          },
          pipeline: ['sum'],
          inputs: [
            {
              timestamp: '2023-07-06T00:00',
              duration: 1,
              'cpu/utilization': 20,
              'cpu/energy': 20,
              'network/energy': 30,
            },
          ],
          outputs: [
            {
              timestamp: '2023-07-06T00:00',
              duration: 1,
              'cpu/utilization': 20,
              'cpu/energy': 20,
              'network/energy': 30,
              'cpu/thermal-design-power': 100,
              'energy-sum': 50,
            },
          ],
        },
      },
    };
    const context = {
      name: 'mock name',
      description: 'mock description',
      tags: null,
      initialize: {
        plugins: {
          multiply: {
            path: 'builtin',
            method: 'Multiply',
            'global-config': {
              'input-parameters': ['cpu/utilization', 'duration'],
              'output-parameter': 'cpu-times-duration',
            },
          },
        },
      },
    };
    const mockRawManifest = {
      ...context,
      tree,
    };

    beforeEach(() => {
      jest.clearAllMocks();
      process.env.CURRENT_DIR = 'mock-dir';
    });

    it('merges manifests correctly when there is more than one manifest.', async () => {
      (getFileName as jest.Mock).mockImplementation(file =>
        file.replace('.yaml', '')
      );
      (load as jest.Mock).mockResolvedValue({rawManifest: mockRawManifest});

      await mergeManifests(mockCommandArgs);

      expect.assertions(4);

      expect(getFileName).toHaveBeenCalledTimes(2);
      expect(load).toHaveBeenCalledTimes(2);
    });

    it('successfully prints merged manifests when the `output` is not provided.', async () => {
      (getFileName as jest.Mock).mockImplementation(file =>
        file.replace('.yaml', '')
      );
      (load as jest.Mock).mockResolvedValue({rawManifest: mockRawManifest});

      const mockCommandArgs = {
        manifests: ['manifest1.yaml', 'manifest2.yaml'],
        name: 'mock name',
        description: 'mock description',
      };
      await mergeManifests(mockCommandArgs);

      expect.assertions(1);
      expect(consopleSpy).toHaveBeenCalledTimes(1);
    });

    it('gets YAML files when there is only one manifest.', async () => {
      const singleManifestArgs = {
        manifests: ['mock-dir'],
        output: 'mock-outputPath',
        name: 'mock name',
        description: 'mock description',
      };
      (getYamlFiles as jest.Mock).mockResolvedValue([
        'manifest1.yaml',
        'manifest2.yaml',
      ]);
      (getFileName as jest.Mock).mockImplementation(file =>
        file.replace('.yaml', '')
      );
      (load as jest.Mock).mockResolvedValue({rawManifest: mockRawManifest});

      await mergeManifests(singleManifestArgs);

      expect.assertions(4);
      expect(getYamlFiles).toHaveBeenCalledWith('mock-dir');
      expect(load).toHaveBeenCalledTimes(2);
    });

    it('uses default values for name and description if not provided.', async () => {
      process.env.CONTEXT = 'default-name-description';

      const defaultArgs = {
        manifests: ['manifest1.yaml', 'manifest2.yaml'],
        output: 'mock-outputPath',
      };

      (getFileName as jest.Mock).mockImplementation(file =>
        file.replace('.yaml', '')
      );
      (load as jest.Mock).mockResolvedValue({rawManifest: mockRawManifest});

      await mergeManifests(defaultArgs);

      expect.assertions(2);
    });
  });
});
