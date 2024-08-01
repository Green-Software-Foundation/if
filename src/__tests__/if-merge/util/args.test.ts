import * as path from 'path';

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
      case 'manifests-are-provided':
        return {manifests: ['mock-manifest1.yaml', 'mock-manifest2.yaml']};
      case 'directory-is-provided':
        return {manifests: ['/mock-directory']};
      case 'flags-are-not-provided':
        return {manifests: undefined, name: undefined, description: undefined};
      case 'manifest-is-not-yaml':
        return {manifests: ['mock-manifest1.yaml', './mock-manifest2']};
      case 'env-throw-error':
        throw new Error('mock-error');
      case 'env-throw':
        throw 'mock-error';
      default:
        return {
          manifests: ['mock-manifest1.yaml', 'mock-manifest2.yaml'],
          output: 'mock-output',
        };
    }
  },
}));

import {ERRORS} from '@grnsft/if-core/utils';

import {parseIfMergeArgs} from '../../../if-merge/util/args';

import {STRINGS as COMMON_STRINGS} from '../../../common/config';

import {STRINGS} from '../../../if-merge/config';

const {InvalidDirectoryError, CliSourceFileError, ParseCliParamsError} = ERRORS;

const {DIRECTORY_NOT_FOUND, MANIFEST_NOT_FOUND} = COMMON_STRINGS;
const {MANIFEST_IS_NOT_YAML} = STRINGS;

describe('if-merge/util/args: ', () => {
  const originalEnv = process.env;

  describe('parseIfMergeArgs(): ', () => {
    const manifests = [
      path.join(process.cwd(), 'mock-manifest1.yaml'),
      path.join(process.cwd(), 'mock-manifest2.yaml'),
    ];
    it('executes when `manifest` is provided.', async () => {
      process.env.fileExists = 'true';
      process.env.result = 'manifests-are-provided';
      const response = await parseIfMergeArgs();

      expect.assertions(1);

      expect(response).toEqual({
        name: undefined,
        description: undefined,
        manifests,
      });
    });

    it('executes when the directory is provided.', async () => {
      process.env.directoryExists = 'true';
      process.env.result = 'directory-is-provided';

      const response = await parseIfMergeArgs();

      expect.assertions(1);

      expect(response).toEqual({
        name: undefined,
        description: undefined,
        manifests: ['/mock-directory'],
      });
    });

    it('throws an error when the directory does not exist.', async () => {
      process.env.directoryExists = 'false';
      process.env.result = 'directory-is-provided';
      expect.assertions(1);

      try {
        await parseIfMergeArgs();
      } catch (error) {
        expect(error).toEqual(new InvalidDirectoryError(DIRECTORY_NOT_FOUND));
      }
    });

    it('throws an error if one of manifests is not a yaml.', async () => {
      process.env.fileExists = 'true';
      process.env.result = 'manifest-is-not-yaml';
      expect.assertions(1);

      try {
        await parseIfMergeArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(
            new CliSourceFileError(MANIFEST_IS_NOT_YAML('./mock-manifest2'))
          );
        }
      }
    });

    it('throws an error if `manifest` path is invalid.', async () => {
      process.env.fileExists = 'false';
      process.env.result = 'manifest-is-not-yaml';
      expect.assertions(1);

      try {
        await parseIfMergeArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(
            new ParseCliParamsError(`mock-manifest1.yaml ${MANIFEST_NOT_FOUND}`)
          );
        }
      }
    });

    it('throws an error if parsing failed.', async () => {
      process.env.result = 'env-throw-error';
      expect.assertions(1);

      try {
        await parseIfMergeArgs();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toEqual(new ParseCliParamsError('mock-error'));
        }
      }
    });

    it('throws error if parsing failed (not instance of error).', async () => {
      process.env.result = 'env-throw';
      expect.assertions(1);

      try {
        await parseIfMergeArgs();
      } catch (error) {
        expect(error).toEqual('mock-error');
      }
    });
  });

  process.env = originalEnv;
});
