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
      default:
        return {
          manifest: 'mock-manifest.yaml',
          output: 'mock-output',
        };
    }
  },
}));

const processRunningPath = process.cwd();
import * as path from 'node:path';

import {ERRORS} from '@grnsft/if-core/utils';

import {parseIfRunProcessArgs} from '../../../if-run/util/args';

import {STRINGS as COMMON_STRINGS} from '../../../common/config';

const {SOURCE_IS_NOT_YAML, MANIFEST_IS_MISSING} = COMMON_STRINGS;
const {CliSourceFileError, ParseCliParamsError} = ERRORS;

describe('if-run/util/args: ', () => {
  describe('parseIfRunProcessArgs(): ', () => {
    it('throws error if there is no argument passed.', () => {
      expect.assertions(4);

      process.env.result = 'error'; // used for mocking

      try {
        parseIfRunProcessArgs();
      } catch (error) {
        expect(error).toEqual(MANIFEST_IS_MISSING);
      }

      process.env.result = 'throw-error-object';

      try {
        parseIfRunProcessArgs();
      } catch (error) {
        expect(error).toEqual(new ParseCliParamsError(MANIFEST_IS_MISSING));
      }

      process.env.result = 'manifest-is-missing';

      try {
        parseIfRunProcessArgs();
      } catch (error) {
        expect(error).toBeInstanceOf(CliSourceFileError);
        expect(error).toEqual(new CliSourceFileError(MANIFEST_IS_MISSING));
      }
    });

    it('returns manifest path.', () => {
      expect.assertions(1);

      process.env.result = 'manifest';

      const result = parseIfRunProcessArgs();
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

      const result = parseIfRunProcessArgs();
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

      const result = parseIfRunProcessArgs();
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

      const result = parseIfRunProcessArgs();
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
        parseIfRunProcessArgs();
      } catch (error) {
        expect(error).toBeInstanceOf(CliSourceFileError);
        expect(error).toEqual(new CliSourceFileError(SOURCE_IS_NOT_YAML));
      }
    });

    it('returns stdout and manifest.', () => {
      expect.assertions(1);

      process.env.result = 'stdout';
      const manifestPath = 'manifest-mock.yaml';

      const response = parseIfRunProcessArgs();
      const expectedResult = {
        inputPath: path.normalize(`${processRunningPath}/${manifestPath}`),
        outputOptions: {
          stdout: true,
        },
      };

      expect(response).toEqual(expectedResult);
    });
  });
});
