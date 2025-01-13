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
      case 'manifest-is-missing':
        return {};
      case 'manifest-install-provided':
        return {
          install: true,
          manifest: 'mock-manifest.yaml',
        };
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

import {parseIfEnvArgs} from '../../../if-env/util/args';

import {STRINGS} from '../../../common/config';

const {CliSourceFileError, ParseCliParamsError} = ERRORS;

const {SOURCE_IS_NOT_YAML, MANIFEST_NOT_FOUND} = STRINGS;

describe('util/args: ', () => {
  const originalEnv = process.env;

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
          expect(error).toEqual(new CliSourceFileError(SOURCE_IS_NOT_YAML));
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

      await expect(parseIfEnvArgs()).rejects.toThrow('process.exit(1) called');

      expect(execFileSync).toHaveBeenCalledWith(
        'npm',
        ['run', 'if-env', '--silent', '--', '-h'],
        {
          cwd: process.env.CURRENT_DIR || process.cwd(),
          stdio: 'inherit',
          shell: false,
        }
      );
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
