jest.mock('ts-command-line-args', () => ({
  __esModule: true,
  parse: () => {
    switch (process.env.result) {
      case 'error':
        return {};
      case 'manifest':
        return {
          manifest: 'manifest-mock.yml',
        };
      case 'manifest-output':
        return {
          manifest: 'manifest-mock.yml',
          output: 'output-mock.yml',
        };
      case 'help':
        return {
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

import {STRINGS} from '../../../config';

const {CliInputError} = ERRORS;

const {MANIFEST_IS_MISSING, FILE_IS_NOT_YAML} = STRINGS;

describe('util/args: ', () => {
  const originalEnv = process.env;

  describe('parseArgs(): ', () => {
    it('throws error if there is no argument passed.', () => {
      expect.assertions(2);

      process.env.result = 'error'; // used for mocking

      try {
        parseArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(CliInputError);
          expect(error.message).toEqual(MANIFEST_IS_MISSING);
        }
      }
    });

    it('returns manifest path.', () => {
      expect.assertions(1);

      process.env.result = 'manifest';

      const result = parseArgs();
      const processRunningPath = process.cwd();

      const manifestPath = 'manifest-mock.yml';
      const expectedResult = {
        inputPath: path.normalize(`${processRunningPath}/${manifestPath}`),
        outputOptions: {
          stdout: undefined,
        },
      };

      expect(result).toEqual(expectedResult);
    });

    it('returns manifest and output path.', () => {
      expect.assertions(1);

      process.env.result = 'manifest-output';

      const result = parseArgs();
      const processRunningPath = process.cwd();

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
        parseArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(CliInputError);
          expect(error.message).toEqual(FILE_IS_NOT_YAML);
        }
      }
    });
  });

  process.env = originalEnv;
});
