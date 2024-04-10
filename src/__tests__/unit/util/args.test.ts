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
      case 'help':
        return {
          manifest: path.normalize(`${processRunningPath}/manifest-mock.yml`),
          help: true,
        };
      case 'not-yaml':
        return {
          manifest: 'mock.notyaml',
        };
      default:
        return {
          manifest: 'mock-manifest.yaml',
          output: 'mock-output',
        };
    }
  },
}));

import path = require('path');

import {parseArgs} from '../../../util/args';
import {ERRORS} from '../../../util/errors';

import {STRINGS, CONFIG} from '../../../config';
const {impact} = CONFIG;
const {HELP} = impact;

const {CliInputError} = ERRORS;

const {MANIFEST_IS_MISSING, FILE_IS_NOT_YAML} = STRINGS;

const info = jest.spyOn(console, 'info').mockImplementation(() => {});

describe('util/args: ', () => {
  const originalEnv = process.env;

  describe('parseArgs(): ', () => {
    it('throws error if there is no argument passed.', () => {
      expect.assertions(5);

      process.env.result = 'error'; // used for mocking

      try {
        parseArgs();
      } catch (error) {
        expect(error).toEqual(MANIFEST_IS_MISSING);
      }

      process.env.result = 'throw-error-object';

      try {
        parseArgs();
      } catch (error) {
        expect(error).toBeInstanceOf(CliInputError);
        expect(error).toEqual(new CliInputError(MANIFEST_IS_MISSING));
      }

      process.env.result = 'manifest-is-missing';

      try {
        parseArgs();
      } catch (error) {
        expect(error).toBeInstanceOf(CliInputError);
        expect(error).toEqual(new CliInputError(MANIFEST_IS_MISSING));
      }
    });

    it('returns manifest path.', () => {
      expect.assertions(1);

      process.env.result = 'manifest';

      const result = parseArgs();
      const manifestPath = 'manifest-mock.yml';
      const expectedResult = {
        inputPath: path.normalize(`${processRunningPath}/${manifestPath}`),
      };

      expect(result).toEqual(expectedResult);
    });

    it('returns manifest with absolute path.', () => {
      expect.assertions(1);

      process.env.result = 'absolute-path';

      const result = parseArgs();
      const manifestPath = 'manifest-mock.yml';
      const expectedResult = {
        inputPath: path.normalize(`${processRunningPath}/${manifestPath}`),
      };

      expect(result).toEqual(expectedResult);
    });

    it('returns manifest with `paramPath`.', () => {
      expect.assertions(1);

      process.env.result = 'override-params';

      const result = parseArgs();
      const manifestPath = 'manifest-mock.yml';
      const expectedResult = {
        inputPath: path.normalize(`${processRunningPath}/${manifestPath}`),
        paramPath: 'override-params-mock.yml',
      };

      expect(result).toEqual(expectedResult);
    });

    it('returns manifest with help.', () => {
      expect.assertions(2);

      process.env.result = 'help';

      const result = parseArgs();

      expect(info).toHaveBeenCalledWith(HELP);
      expect(result).toEqual({});
    });

    it('returns manifest and output path.', () => {
      expect.assertions(1);

      process.env.result = 'manifest-output';

      const result = parseArgs();
      const manifestPath = 'manifest-mock.yml';
      const outputPath = 'output-mock.yml';
      const expectedResult = {
        inputPath: path.normalize(`${processRunningPath}/${manifestPath}`),
        outputPath: path.normalize(`${processRunningPath}/${outputPath}`),
      };

      expect(result).toEqual(expectedResult);
    });

    it('throws error if file is not yaml.', () => {
      expect.assertions(2);

      process.env.result = 'not-yaml';

      try {
        parseArgs();
      } catch (error) {
        expect(error).toBeInstanceOf(CliInputError);
        expect(error).toEqual(new CliInputError(FILE_IS_NOT_YAML));
      }
    });
  });

  process.env = originalEnv;
});
