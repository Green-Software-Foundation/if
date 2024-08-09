import * as fs from 'fs/promises';
import * as path from 'path';

jest.mock('fs/promises', () => require('../../../__mocks__/fs'));

const mockInfo = jest.fn();

jest.mock('node:readline/promises', () =>
  require('../../../__mocks__/readline')
);
jest.mock('../../../common/util/logger', () => ({
  logger: {
    info: mockInfo,
  },
}));

jest.mock('../../../common/util/helpers', () => {
  const originalModule = jest.requireActual('../../../if-run/util/helpers');

  return {
    ...originalModule,
    execPromise: async (param: any) => {
      switch (process.env.NPM_INSTALL) {
        case 'true':
          expect(param).toEqual('npm install @grnsft/if@0.3.3-beta.0');
          break;
        case 'npm init -y':
          expect(param).toEqual('npm init -y');
          break;
        case 'if-check':
          expect(param).toEqual(
            "npm run if-env  -- -m ./src/__mocks__/mock-manifest.yaml && npm run if-run  -- -m ./src/__mocks__/mock-manifest.yaml -o src/__mocks__/re-mock-manifest &&  node -p 'Boolean(process.stdout.isTTY)' | npm run if-diff  -- -s src/__mocks__/re-mock-manifest.yaml -t ./src/__mocks__/mock-manifest.yaml"
          );
          break;
      }
      return;
    },
  };
});

import {
  installDependencies,
  initPackageJsonIfNotExists,
  updatePackageJsonDependencies,
  extractPathsWithVersion,
  updatePackageJsonProperties,
} from '../../../if-env/util/npm';
import {isFileExists} from '../../../common/util/fs';

import {STRINGS} from '../../../if-env/config';
import {ManifestPlugin} from '../../../if-env/types/npm';

const {INITIALIZING_PACKAGE_JSON, INSTALLING_NPM_PACKAGES} = STRINGS;

describe('util/npm: ', () => {
  const folderPath = path.resolve(__dirname, 'npm-test');

  describe('initPackageJsonIfNotExists(): ', () => {
    it('initializes package.json if it does not exist.', async () => {
      process.env.NPM_INSTALL = 'npm init -y';
      isFileExists('true');

      await initPackageJsonIfNotExists(folderPath);

      expect.assertions(2);
      expect(mockInfo).toHaveBeenCalledWith(INITIALIZING_PACKAGE_JSON);
    });

    it('returns the package.json path if it exists.', async () => {
      const packageJsonPath = path.resolve(folderPath, 'package.json');
      isFileExists('false');

      const result = await initPackageJsonIfNotExists(folderPath);

      expect.assertions(2);
      expect(result).toBe(packageJsonPath);
    });
  });

  describe('installDependencies(): ', () => {
    const dependencies = {
      '@grnsft/if': '^0.3.3-beta.0',
    };

    it('calls execPromise with the correct arguments.', async () => {
      process.env.NPM_INSTALL = 'true';
      expect.assertions(1);

      await installDependencies(folderPath, dependencies);
    });

    it('logs the installation message.', async () => {
      const dependencies = {
        '@grnsft/if': '^0.3.3-beta.0',
      };

      await installDependencies(folderPath, dependencies);

      expect.assertions(2);
      expect(mockInfo).toHaveBeenCalledWith(INSTALLING_NPM_PACKAGES);
    });
  });

  describe('updatePackageJsonDependencies(): ', () => {
    it('successfully updates the package.json dependencies when cwd is false.', async () => {
      const dependencies = {
        '@grnsft/if-plugins': '^0.3.3-beta.0',
      };
      const packageJsonPath = path.join(folderPath, 'package.json-npm');

      const expectedPackageJsonContent = JSON.stringify(
        {
          dependencies: {
            '@grnsft/if-plugins': '^0.3.3-beta.0',
          },
        },
        null,
        2
      );

      const fsReadSpy = jest
        .spyOn(fs, 'readFile')
        .mockResolvedValue(expectedPackageJsonContent);
      await updatePackageJsonDependencies(packageJsonPath, dependencies, false);

      expect.assertions(2);

      expect(fsReadSpy).toHaveBeenCalledWith(packageJsonPath, 'utf8');
    });

    it('successfully updates the package.json dependencies when cwd is true.', async () => {
      const dependencies = {
        '@grnsft/if-plugins': '^0.3.3-beta.0',
      };
      const packageJsonPath = path.join(folderPath, 'package.json-npm');

      const expectedPackageJsonContent = JSON.stringify(
        {
          dependencies: {
            '@grnsft/if-plugins': '^0.3.3-beta.0',
          },
        },
        null,
        2
      );

      const fsReadSpy = jest
        .spyOn(fs, 'readFile')
        .mockResolvedValue(expectedPackageJsonContent);
      await updatePackageJsonDependencies(packageJsonPath, dependencies, true);

      expect.assertions(2);

      expect(fsReadSpy).toHaveBeenCalledWith(packageJsonPath, 'utf8');
    });
  });

  describe('extractPathsWithVersion(): ', () => {
    it('extracts paths with correct versions.', () => {
      const plugins: ManifestPlugin = {
        'cloud-metadata': {
          path: '@grnsft/if-plugins',
          method: 'CloudMetadata',
        },
        divide: {
          path: 'builtin',
          method: 'Divide',
        },
        'boavizta-cpu': {
          path: '@grnsft/if-unofficial-plugins',
          method: 'BoaviztaCpuOutput',
        },
      };
      const dependencies = [
        '@babel/core@7.22.10',
        '@babel/preset-typescript@7.23.3',
        '@commitlint/cli@18.6.0',
        '@commitlint/config-conventional@18.6.0',
        '@grnsft/if-core@0.0.7',
        '@grnsft/if-plugins@v0.3.2',
        '@grnsft/if-unofficial-plugins@v0.3.0 extraneous -> file:../../../if-unofficial-models',
        '@jest/globals@29.7.0',
      ];

      const result = extractPathsWithVersion(plugins, dependencies);

      expect.assertions(1);
      expect(result).toEqual({
        '@grnsft/if-plugins': '^v0.3.2',
        '@grnsft/if-unofficial-plugins': '^v0.3.0',
      });
    });

    it('returns an empty object if no matches found', () => {
      const plugins: ManifestPlugin = {
        'cloud-metadata': {
          path: '@grnsft/if-plugins',
          method: 'CloudMetadata',
        },
        divide: {
          path: 'builtin',
          method: 'Divide',
        },
        'boavizta-cpu': {
          path: '@grnsft/if-unofficial-plugins',
          method: 'BoaviztaCpuOutput',
        },
      };
      const dependencies = [
        '@babel/core@7.22.10',
        '@babel/preset-typescript@7.23.3',
      ];

      expect.assertions(1);
      const result = extractPathsWithVersion(plugins, dependencies);
      expect(result).toEqual({});
    });
  });

  describe('updatePackageJsonProperties(): ', () => {
    it('updates the package.json properties correctly.', async () => {
      const packageJsonPath = path.join(folderPath, 'package.json-npm1');

      const expectedPackageJsonContent = JSON.stringify(
        {
          name: 'if-environment',
          description: 'mock-description',
          author: {},
          bugs: {},
          engines: {},
          homepage: 'mock-homepage',
          dependencies: {
            '@grnsft/if-plugins': '^0.3.3-beta.0',
          },
        },
        null,
        2
      );

      const fsReadSpy = jest
        .spyOn(fs, 'readFile')
        .mockResolvedValue(expectedPackageJsonContent);
      await updatePackageJsonProperties(packageJsonPath, true);

      expect.assertions(8);

      expect(fsReadSpy).toHaveBeenCalledWith(packageJsonPath, 'utf8');
    });
  });
});
