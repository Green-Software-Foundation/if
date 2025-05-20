import {execFileSync} from 'child_process';

jest.mock('child_process', () => {
  const originalModule = jest.requireActual('child_process');
  return {
    ...originalModule,
    execFileSync: jest.fn(() => {
      return 'Command executed successfully';
    }),
  };
});

jest.mock('../../../common/util/fs', () => ({
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
      case 'manifest':
        return {
          manifest: 'manifest-mock.yml',
        };
      case 'manifest-is-missing':
        return {};
      case 'manifest-is-not-yaml':
        return {manifest: 'manifest'};
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

import {ERRORS} from '@grnsft/if-core/utils';

import {parseIfCsvArgs} from '../../../if-csv/util/args';

import {STRINGS} from '../../../common/config';

const {CliSourceFileError, ParseCliParamsError} = ERRORS;

const {SOURCE_IS_NOT_YAML, MANIFEST_NOT_FOUND} = STRINGS;

describe('util/args: ', () => {
  const originalEnv = process.env;

  describe('parseIfCsvArgs(): ', () => {
    it('successfully executes when `manifest` is specified.', async () => {
      process.env.fileExists = 'true';
      process.env.result = 'manifest';
      const response = await parseIfCsvArgs();

      expect.assertions(1);

      expect(response).toEqual({
        manifest: 'manifest-mock.yml',
        output: undefined,
        params: undefined,
      });
    });

    it('executes if `manifest` is missing.', async () => {
      process.env.fileExists = 'true';
      process.env.result = 'manifest-is-missing';
      const response = await parseIfCsvArgs();

      expect.assertions(1);

      expect(response).toEqual({});
    });

    it('throws an error if `manifest` is not a yaml.', async () => {
      process.env.fileExists = 'true';
      process.env.result = 'manifest-is-not-yaml';
      expect.assertions(1);

      try {
        await parseIfCsvArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(new CliSourceFileError(SOURCE_IS_NOT_YAML));
        }
      }
    });

    it('throws an error if `manifest` path is invalid.', async () => {
      process.env.fileExists = 'false';
      expect.assertions(1);

      try {
        await parseIfCsvArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(new ParseCliParamsError(MANIFEST_NOT_FOUND));
        }
      }
    });

    it('runs help command if the passed argument is incorrect.', async () => {
      expect.assertions(3);
      jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
        expect(code).toEqual(1);
        throw new Error(`process.exit(${code}) called`);
      });

      process.env.result = 'env-throw-error';

      await expect(parseIfCsvArgs()).rejects.toThrow('process.exit(1) called');

      expect(execFileSync).toHaveBeenCalledWith(
        process.execPath,
        [...process.execArgv, process.argv[1], '-h'],
        {
          stdio: 'inherit',
        }
      );
    });

    it('throws error if parsing failed (not instance of error).', async () => {
      process.env.result = 'env-throw';
      expect.assertions(1);

      try {
        await parseIfCsvArgs();
      } catch (error) {
        expect(error).toEqual('mock-error');
      }
    });
  });

  process.env = originalEnv;
});
