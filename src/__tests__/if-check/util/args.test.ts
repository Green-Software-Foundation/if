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
  isDirectoryExists: () => {
    if (process.env.directoryExists === 'true') {
      return true;
    }
    return false;
  },
}));

jest.mock('ts-command-line-args', () => ({
  __esModule: true,
  parse: () => {
    switch (process.env.result) {
      case 'manifest-is-provided':
        return {manifest: 'mock-manifest.yaml'};
      case 'directory-is-provided':
        return {directory: '/mock-directory'};
      case 'flags-are-not-provided':
        return {manifest: undefined, directory: undefined};
      default:
        return {
          manifest: 'mock-manifest.yaml',
          output: 'mock-output',
        };
    }
  },
}));

jest.mock('ts-command-line-args', () => ({
  __esModule: true,
  parse: () => {
    switch (process.env.result) {
      /** If-env mocks */
      case 'manifest-is-not-yaml':
        return {manifest: 'manifest'};
      case 'env-throw-error':
        throw new Error('mock-error');
      case 'env-throw':
        throw 'mock-error';
      /** If-check */
      case 'manifest-is-provided':
        return {manifest: 'mock-manifest.yaml'};
      case 'directory-is-provided':
        return {directory: '/mock-directory'};
      case 'flags-are-not-provided':
        return {manifest: undefined, directory: undefined};
      default:
        return {
          manifest: 'mock-manifest.yaml',
          output: 'mock-output',
        };
    }
  },
}));

import {ERRORS} from '@grnsft/if-core/utils';

import {parseIfCheckArgs} from '../../../if-check/util/args';

import {STRINGS} from '../../../if-check/config';
import {STRINGS as COMMON_STRINGS} from '../../../common/config';

const {
  InvalidDirectoryError,
  MissingCliFlagsError,
  CliSourceFileError,
  ParseCliParamsError,
} = ERRORS;
const {IF_CHECK_FLAGS_MISSING} = STRINGS;
const {SOURCE_IS_NOT_YAML, MANIFEST_NOT_FOUND, DIRECTORY_NOT_FOUND} =
  COMMON_STRINGS;

describe('if-check/util: ', () => {
  const originalEnv = process.env;

  describe('parseIfCheckArgs(): ', () => {
    it('executes when `manifest` is provided.', async () => {
      process.env.fileExists = 'true';
      process.env.result = 'manifest-is-provided';
      const response = await parseIfCheckArgs();

      expect.assertions(1);

      expect(response).toEqual({manifest: 'mock-manifest.yaml'});
    });

    it('executes when the `directory` is provided.', async () => {
      process.env.directoryExists = 'true';
      process.env.result = 'directory-is-provided';

      const response = await parseIfCheckArgs();

      expect.assertions(1);

      expect(response).toEqual({directory: '/mock-directory'});
    });

    it('throws an error when the `directory` does not exist.', async () => {
      process.env.directoryExists = 'false';
      process.env.result = 'directory-is-provided';
      expect.assertions(1);

      try {
        await parseIfCheckArgs();
      } catch (error) {
        expect(error).toEqual(new InvalidDirectoryError(DIRECTORY_NOT_FOUND));
      }
    });

    it('throws an error when both `manifest` and `directory` flags are not provided.', async () => {
      process.env.result = 'flags-are-not-provided';
      expect.assertions(1);

      try {
        await parseIfCheckArgs();
      } catch (error) {
        expect(error).toEqual(new MissingCliFlagsError(IF_CHECK_FLAGS_MISSING));
      }
    });

    it('throws an error if `manifest` is not a yaml.', async () => {
      process.env.fileExists = 'true';
      process.env.result = 'manifest-is-not-yaml';
      expect.assertions(1);

      try {
        await parseIfCheckArgs();
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
        await parseIfCheckArgs();
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

      await expect(parseIfCheckArgs()).rejects.toThrow(
        'process.exit(1) called'
      );

      expect(execFileSync).toHaveBeenCalledWith(
        'npm',
        ['run', 'if-check', '--silent', '--', '-h'],
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
        await parseIfCheckArgs();
      } catch (error) {
        expect(error).toEqual('mock-error');
      }
    });
  });

  process.env = originalEnv;
});
