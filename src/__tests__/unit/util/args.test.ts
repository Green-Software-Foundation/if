const processRunningPath = process.cwd();

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
      default:
        return {
          manifest: 'mock-manifest.yaml',
          output: 'mock-output',
        };
    }
  },
}));

import path = require('path');

import {parseIEProcessArgs, parseIfDiffArgs} from '../../../util/args';
import {ERRORS} from '../../../util/errors';

import {STRINGS} from '../../../config';

const {CliInputError} = ERRORS;

const {
  MANIFEST_IS_MISSING,
  FILE_IS_NOT_YAML,
  TARGET_IS_NOT_YAML,
  INVALID_TARGET,
  SOURCE_IS_NOT_YAML,
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
        expect(error).toBeInstanceOf(CliInputError);
        expect(error).toEqual(new CliInputError(MANIFEST_IS_MISSING));
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
        expect(error).toBeInstanceOf(CliInputError);
        expect(error).toEqual(new CliInputError(FILE_IS_NOT_YAML));
      }
    });
  });

  describe('parseIfDiffArgs(): ', () => {
    it('throws error if `target` is missing.', async () => {
      expect.assertions(1);

      try {
        await parseIfDiffArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(new CliInputError(INVALID_TARGET));
        }
      }
    });

    it('throws error if `target` is not a yaml.', async () => {
      process.env.result = 'target-is-not-yaml';
      expect.assertions(1);

      try {
        await parseIfDiffArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(new CliInputError(TARGET_IS_NOT_YAML));
        }
      }
    });

    it('returns `target`s full path.', async () => {
      process.env.result = 'only-target';
      expect.assertions(1);

      const response = await parseIfDiffArgs();
      expect(response).toHaveProperty('targetPath');
    });

    it('throws error if source is not a yaml.', async () => {
      process.env.result = 'source-is-not-yaml';
      expect.assertions(1);

      try {
        await parseIfDiffArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(new CliInputError(SOURCE_IS_NOT_YAML));
        }
      }
    });

    it('returns target and source full paths.', async () => {
      process.env.result = 'target-source';
      expect.assertions(2);

      const response = await parseIfDiffArgs();
      expect(response).toHaveProperty('targetPath');
      expect(response).toHaveProperty('sourcePath');
    });

    it('throws error if parsing failed.', async () => {
      process.env.result = 'diff-throw-error';
      expect.assertions(1);

      try {
        await parseIfDiffArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(new CliInputError('mock-error'));
        }
      }
    });

    it('throws error if parsing failed (not instance of error).', async () => {
      process.env.result = 'diff-throw';
      expect.assertions(1);

      try {
        await parseIfDiffArgs();
      } catch (error) {
        expect(error).toEqual('mock-error');
      }
    });
  });

  process.env = originalEnv;
});
