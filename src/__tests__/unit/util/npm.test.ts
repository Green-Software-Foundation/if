import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

jest.mock('fs/promises', () => require('../../../__mocks__/fs'));

const mockInfo = jest.fn();

jest.mock('node:readline/promises', () =>
  require('../../../__mocks__/readline')
);
jest.mock('../../../util/logger', () => ({
  logger: {
    info: mockInfo,
  },
}));

import {
  installDependencies,
  initPackageJsonIfNotExists,
  updatePackageJsonDependencies,
  extractPathsWithVersion,
  updatePackageJsonProperties,
} from '../../../util/npm';
import {isFileExists} from '../../../util/fs';

import {STRINGS} from '../../../config/strings';
import {ManifestPlugin} from '../../../types/npm';

const {INITIALIZING_PACKAGE_JSON, INSTALLING_NPM_PACKAGES} = STRINGS;

describe('util/npm: ', () => {
  const helpers = require('../../../util/helpers');
  const folderPath = path.resolve(__dirname, 'npm-test');

  beforeAll(() => {
    if (!fsSync.existsSync(folderPath)) {
      fsSync.mkdirSync(folderPath, {recursive: true});
    }
  });

  afterAll(() => {
    if (fsSync.existsSync(folderPath)) {
      fsSync.rmSync(folderPath, {recursive: true, force: true});
    }
  });

  describe('initPackageJsonIfNotExists(): ', () => {
    it('initializes package.json if it does not exist.', async () => {
      const spyExecPromise = jest.spyOn(helpers, 'execPromise');
      isFileExists('true');

      await initPackageJsonIfNotExists(folderPath);

      expect.assertions(2);
      expect(mockInfo).toHaveBeenCalledWith(INITIALIZING_PACKAGE_JSON);
      expect(spyExecPromise).toHaveBeenCalledWith('npm init -y', {
        cwd: folderPath,
      });
    });

    it('returns the package.json path if it exists.', async () => {
      const packageJsonPath = path.resolve(folderPath, 'package.json');
      isFileExists('false');

      const result = await initPackageJsonIfNotExists(folderPath);

      expect.assertions(1);
      expect(result).toBe(packageJsonPath);
    });
  });

  describe('installDependencies(): ', () => {
    const dependencies = {
      '@grnsft/if': '^0.3.3-beta.0',
    };

    it('calls execPromise with the correct arguments.', async () => {
      const spyExecPromise = jest.spyOn(helpers, 'execPromise');
      const formattedDependencies = ['@grnsft/if@0.3.3-beta.0'];
      expect.assertions(1);

      await installDependencies(folderPath, dependencies);

      expect(spyExecPromise).toHaveBeenCalledWith(
        `npm install ${formattedDependencies.join(' ')}`,
        {cwd: folderPath}
      );
    }, 30000);

    it('logs the installation message.', async () => {
      const dependencies = {
        '@grnsft/if': '^0.3.3-beta.0',
      };

      await installDependencies(folderPath, dependencies);

      expect.assertions(1);
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
            '@grnsft/if': '^0.3.3-beta.0',
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
            '@grnsft/if': '^0.3.3-beta.0',
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
        '@grnsft/if-plugins@v0.3.2 extraneous -> file:../../../if-models',
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
      const newPackageJsonPath = path.resolve(folderPath, '/package.json-npm');
      await updatePackageJsonProperties(newPackageJsonPath, false);

      expect.assertions(2);
      expect(fs.readFile).toHaveBeenCalledWith(newPackageJsonPath, 'utf8');
    });
  });
});
