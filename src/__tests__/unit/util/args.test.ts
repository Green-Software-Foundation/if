const processRunningPath = process.cwd();

jest.mock('../../../util/helpers', () => ({
  isFileExists: () => {
    if (process.env.fileExists === 'true') {
      return true;
    }
    return false;
  },
}));

jest.mock('ts-command-line-args', () => ({
  __esModule: true,
  parse: () => {
    switch (process.env.result) {
      case 'throw-error-object':
        throw new Error(MANIFEST_IS_MISSING);
      case 'error':
        throw MANIFEST_IS_MISSING;
      case 'manifest-is-missing':
        return {};
      case 'manifest':
        return {
          manifest: 'manifest-mock.yml',
        };
      case 'absolute-path':
        return {
          manifest: path.normalize(`${processRunningPath}/manifest-mock.yml`),
        };
      case 'manifest-output':
        return {
          manifest: 'manifest-mock.yml',
          output: 'output-mock.yml',
        };
      case 'override-params':
        return {
          manifest: 'manifest-mock.yml',
          'override-params': 'override-params-mock.yml',
        };
      case 'not-yaml':
        return {
          manifest: 'mock.notyaml',
        };
      case 'stdout':
        return {
          manifest: 'manifest-mock.yaml',
          stdout: true,
        };
      /** If-diff mocks */
      case 'only-target':
        return {
          target: 'target-mock.yml',
        };
      case 'target-is-not-yaml':
        return {
          target: 'target-mock',
        };
      case 'source-is-not-yaml':
        return {
          target: 'target-mock.yml',
          source: 'source-mock',
        };
      case 'target-source':
        return {
          target: 'target-mock.yml',
          source: 'source-mock.yml',
        };
      case 'diff-throw-error':
        throw new Error('mock-error');
      case 'diff-throw':
        throw 'mock-error';
      /** If-env mocks */
      // case 'env-manifest-is-missing':
      //   return;
      case 'manifest-install-provided':
        return {
          install: true,
          manifest: 'mock-manifest.yaml',
        };
      case 'manifest-is-not-yaml':
        return {manifest: 'manifest'};
      case 'manifest-path-invalid':
        throw new Error(MANIFEST_NOT_FOUND);
      case 'env-throw-error':
        throw new Error('mock-error');
      case 'env-throw':
        throw 'mock-error';
      default:
        return {
          manifest: 'mock-manifest.yaml',
          output: 'mock-output',
        };
    }
  },
}));

import * as path from 'node:path';
import {ERRORS} from '@grnsft/if-core';

import {
  parseIEProcessArgs,
  parseIfDiffArgs,
  parseIfEnvArgs,
} from '../../../util/args';

import {STRINGS} from '../../../config';

const {CliInputError, CliSourceFileError} = ERRORS;

const {
  MANIFEST_IS_MISSING,
  FILE_IS_NOT_YAML,
  TARGET_IS_NOT_YAML,
  INVALID_TARGET,
  SOURCE_IS_NOT_YAML,
  MANIFEST_NOT_FOUND,
} = STRINGS;

describe('util/args: ', () => {
  const originalEnv = process.env;

  describe('parseIEProcessArgs(): ', () => {
    it('throws error if there is no argument passed.', () => {
      expect.assertions(5);

      process.env.result = 'error'; // used for mocking

      try {
        parseIEProcessArgs();
      } catch (error) {
        expect(error).toEqual(MANIFEST_IS_MISSING);
      }

      process.env.result = 'throw-error-object';

      try {
        parseIEProcessArgs();
      } catch (error) {
        expect(error).toBeInstanceOf(CliInputError);
        expect(error).toEqual(new CliInputError(MANIFEST_IS_MISSING));
      }

      process.env.result = 'manifest-is-missing';

      try {
        parseIEProcessArgs();
      } catch (error) {
        expect(error).toBeInstanceOf(CliSourceFileError);
        expect(error).toEqual(new CliSourceFileError(MANIFEST_IS_MISSING));
      }
    });

    it('returns manifest path.', () => {
      expect.assertions(1);

      process.env.result = 'manifest';

      const result = parseIEProcessArgs();
      const manifestPath = 'manifest-mock.yml';
      const expectedResult = {
        inputPath: path.normalize(`${processRunningPath}/${manifestPath}`),
        outputOptions: {
          stdout: undefined,
        },
      };

      expect(result).toEqual(expectedResult);
    });

    it('returns manifest with absolute path.', () => {
      expect.assertions(1);

      process.env.result = 'absolute-path';

      const result = parseIEProcessArgs();
      const manifestPath = 'manifest-mock.yml';
      const expectedResult = {
        inputPath: path.normalize(`${processRunningPath}/${manifestPath}`),
        outputOptions: {},
      };

      expect(result).toEqual(expectedResult);
    });

    it('returns manifest with `paramPath`.', () => {
      expect.assertions(1);

      process.env.result = 'override-params';

      const result = parseIEProcessArgs();
      const manifestPath = 'manifest-mock.yml';
      const expectedResult = {
        inputPath: path.normalize(`${processRunningPath}/${manifestPath}`),
        paramPath: 'override-params-mock.yml',
        outputOptions: {},
      };

      expect(result).toEqual(expectedResult);
    });

    it('returns manifest and output path.', () => {
      expect.assertions(1);

      process.env.result = 'manifest-output';

      const result = parseIEProcessArgs();
      const manifestPath = 'manifest-mock.yml';
      const outputPath = 'output-mock.yml';
      const expectedResult = {
        inputPath: path.normalize(`${processRunningPath}/${manifestPath}`),
        outputOptions: {
          outputPath: path.normalize(`${processRunningPath}/${outputPath}`),
          stdout: undefined,
        },
      };

      expect(result).toEqual(expectedResult);
    });

    it('throws error if file is not yaml.', () => {
      expect.assertions(2);

      process.env.result = 'not-yaml';

      try {
        parseIEProcessArgs();
      } catch (error) {
        expect(error).toBeInstanceOf(CliSourceFileError);
        expect(error).toEqual(new CliSourceFileError(FILE_IS_NOT_YAML));
      }
    });

    it('returns stdout and manifest.', () => {
      expect.assertions(1);

      process.env.result = 'stdout';
      const manifestPath = 'manifest-mock.yaml';

      const response = parseIEProcessArgs();
      const expectedResult = {
        inputPath: path.normalize(`${processRunningPath}/${manifestPath}`),
        outputOptions: {
          stdout: true,
        },
      };

      expect(response).toEqual(expectedResult);
    });
  });

  describe('parseIfDiffArgs(): ', () => {
    it('throws error if `target` is missing.', () => {
      expect.assertions(1);

      try {
        parseIfDiffArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(new CliInputError(INVALID_TARGET));
        }
      }
    });

    it('throws error if `target` is not a yaml.', () => {
      process.env.result = 'target-is-not-yaml';
      expect.assertions(1);

      try {
        parseIfDiffArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(new CliInputError(TARGET_IS_NOT_YAML));
        }
      }
    });

    it('returns `target`s full path.', () => {
      process.env.result = 'only-target';
      expect.assertions(1);

      const response = parseIfDiffArgs();
      expect(response).toHaveProperty('targetPath');
    });

    it('throws error if source is not a yaml.', () => {
      process.env.result = 'source-is-not-yaml';
      expect.assertions(1);

      try {
        parseIfDiffArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(new CliInputError(SOURCE_IS_NOT_YAML));
        }
      }
    });

    it('returns target and source full paths.', () => {
      process.env.result = 'target-source';
      expect.assertions(2);

      const response = parseIfDiffArgs();
      expect(response).toHaveProperty('targetPath');
      expect(response).toHaveProperty('sourcePath');
    });

    it('throws error if parsing failed.', () => {
      process.env.result = 'diff-throw-error';
      expect.assertions(1);

      try {
        parseIfDiffArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(new CliInputError('mock-error'));
        }
      }
    });

    it('throws error if parsing failed (not instance of error).', () => {
      process.env.result = 'diff-throw';
      expect.assertions(1);

      try {
        parseIfDiffArgs();
      } catch (error) {
        expect(error).toEqual('mock-error');
      }
    });
  });

  describe('parseIfEnvArgs(): ', () => {
    it('executes if `manifest` is missing.', async () => {
      process.env.fileExists = 'true';
      process.env.result = 'manifest-is-missing';
      const response = await parseIfEnvArgs();

      expect.assertions(1);

      expect(response).toEqual({install: undefined});
    });

    it('executes if `manifest` and `install` are provided.', async () => {
      process.env.fileExists = 'true';
      process.env.result = 'manifest-install-provided';

      const response = await parseIfEnvArgs();

      expect.assertions(2);
      expect(response).toHaveProperty('install');
      expect(response).toHaveProperty('manifest');
    });

    it('throws an error if `manifest` is not a yaml.', async () => {
      process.env.fileExists = 'true';
      process.env.result = 'manifest-is-not-yaml';
      expect.assertions(1);

      try {
        await parseIfEnvArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(new CliInputError(FILE_IS_NOT_YAML));
        }
      }
    });

    it('throws an error if `manifest` path is invalid.', async () => {
      process.env.fileExists = 'false';
      expect.assertions(1);

      try {
        await parseIfEnvArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(new CliInputError(MANIFEST_NOT_FOUND));
        }
      }
    });

    it('throws an error if parsing failed.', async () => {
      process.env.result = 'env-throw-error';
      expect.assertions(1);

      try {
        await parseIfEnvArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(new CliInputError('mock-error'));
        }
      }
    });

    it('throws error if parsing failed (not instance of error).', async () => {
      process.env.result = 'env-throw';
      expect.assertions(1);

      try {
        await parseIfEnvArgs();
      } catch (error) {
        expect(error).toEqual('mock-error');
      }
    });
  });

  process.env = originalEnv;
});
