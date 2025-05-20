import * as path from 'path';

const mockInfo = jest.fn();

jest.mock('node:readline/promises', () =>
  require('../../../__mocks__/readline')
);
jest.mock('../../../common/util/logger', () => ({
  logger: {
    info: mockInfo,
  },
}));

const mockExecFileSync = jest.fn();

jest.mock('child_process', () => {
  const originalModule = jest.requireActual('child_process');
  return {
    ...originalModule,
    execFileSync: mockExecFileSync,
  };
});

import {executeCommands} from '../../../if-check/util/npm';

describe('if-check/util/npm: ', () => {
  const originalEnv = process.env;
  const originalArgv1 = process.argv[1];
  const logSpy = jest.spyOn(global.console, 'log');

  describe('executeCommands(): ', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      process.env = {...originalEnv};
    });

    afterEach(() => {
      process.env = originalEnv;
      process.argv[1] = originalArgv1;
    });

    it('successfully executes with correct commands.', async () => {
      process.argv[1] = '/path/to/if-check/index.js';
      const manifest = './src/__mocks__/mock-manifest.yaml';

      await executeCommands(manifest);

      const manifestPath = path.resolve(manifest);
      const executedManifest = path.resolve('src/__mocks__/re-mock-manifest');

      expect.assertions(5);
      expect(logSpy).toHaveBeenCalledWith(
        '✔ if-check successfully verified mock-manifest.yaml\n'
      );
      expect(mockExecFileSync).toHaveBeenCalledTimes(3);
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        1,
        process.execPath,
        [...process.execArgv, '/path/to/if-env', '-m', manifestPath],
        {stdio: 'ignore'}
      );
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        2,
        process.execPath,
        [
          ...process.execArgv,
          '/path/to/if-run',
          '-m',
          manifestPath,
          '-o',
          executedManifest,
        ],
        {stdio: 'ignore'}
      );
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        3,
        process.execPath,
        [
          ...process.execArgv,
          '/path/to/if-diff',
          '-s',
          `${executedManifest}.yaml`,
          '-t',
          manifestPath,
        ],
        {stdio: 'inherit'}
      );
    });

    it('successfully executes with env-var CURRENT_DIR.', async () => {
      process.env.CURRENT_DIR = path.resolve('src');
      process.argv[1] = '/path/to/if-check/index.js';
      const manifest = './__mocks__/mock-manifest.yaml';

      await executeCommands(manifest);

      const manifestPath = path.resolve(process.env.CURRENT_DIR!, manifest);
      const executedManifest = path.resolve(
        process.env.CURRENT_DIR!,
        '__mocks__/re-mock-manifest'
      );

      expect.assertions(5);
      expect(logSpy).toHaveBeenCalledWith(
        '✔ if-check successfully verified mock-manifest.yaml\n'
      );
      expect(mockExecFileSync).toHaveBeenCalledTimes(3);
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        1,
        process.execPath,
        [...process.execArgv, '/path/to/if-env', '-m', manifestPath],
        {stdio: 'ignore'}
      );
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        2,
        process.execPath,
        [
          ...process.execArgv,
          '/path/to/if-run',
          '-m',
          manifestPath,
          '-o',
          executedManifest,
        ],
        {stdio: 'ignore'}
      );
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        3,
        process.execPath,
        [
          ...process.execArgv,
          '/path/to/if-diff',
          '-s',
          `${executedManifest}.yaml`,
          '-t',
          manifestPath,
        ],
        {stdio: 'inherit'}
      );
    });

    it('successfully executes if the entry-point ends with /index.ts.', async () => {
      process.argv[1] = '/path/to/if-check/index.ts';
      const manifest = './src/__mocks__/mock-manifest.yaml';

      await executeCommands(manifest);

      const manifestPath = path.resolve(manifest);
      const executedManifest = path.resolve('src/__mocks__/re-mock-manifest');

      expect.assertions(5);
      expect(logSpy).toHaveBeenCalledWith(
        '✔ if-check successfully verified mock-manifest.yaml\n'
      );
      expect(mockExecFileSync).toHaveBeenCalledTimes(3);
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        1,
        process.execPath,
        [...process.execArgv, '/path/to/if-env', '-m', manifestPath],
        {stdio: 'ignore'}
      );
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        2,
        process.execPath,
        [
          ...process.execArgv,
          '/path/to/if-run',
          '-m',
          manifestPath,
          '-o',
          executedManifest,
        ],
        {stdio: 'ignore'}
      );
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        3,
        process.execPath,
        [
          ...process.execArgv,
          '/path/to/if-diff',
          '-s',
          `${executedManifest}.yaml`,
          '-t',
          manifestPath,
        ],
        {stdio: 'inherit'}
      );
    });

    it('successfully executes if the entry-point without extension.', async () => {
      process.argv[1] = '/path/to/if-check/index';
      const manifest = './src/__mocks__/mock-manifest.yaml';

      await executeCommands(manifest);

      const manifestPath = path.resolve(manifest);
      const executedManifest = path.resolve('src/__mocks__/re-mock-manifest');

      expect.assertions(5);
      expect(logSpy).toHaveBeenCalledWith(
        '✔ if-check successfully verified mock-manifest.yaml\n'
      );
      expect(mockExecFileSync).toHaveBeenCalledTimes(3);
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        1,
        process.execPath,
        [...process.execArgv, '/path/to/if-env', '-m', manifestPath],
        {stdio: 'ignore'}
      );
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        2,
        process.execPath,
        [
          ...process.execArgv,
          '/path/to/if-run',
          '-m',
          manifestPath,
          '-o',
          executedManifest,
        ],
        {stdio: 'ignore'}
      );
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        3,
        process.execPath,
        [
          ...process.execArgv,
          '/path/to/if-diff',
          '-s',
          `${executedManifest}.yaml`,
          '-t',
          manifestPath,
        ],
        {stdio: 'inherit'}
      );
    });

    it('successfully executes if the entry-point without /index.[jt]s.', async () => {
      process.argv[1] = '/path/to/if-check';
      const manifest = './src/__mocks__/mock-manifest.yaml';

      await executeCommands(manifest);

      const manifestPath = path.resolve(manifest);
      const executedManifest = path.resolve('src/__mocks__/re-mock-manifest');

      expect.assertions(5);
      expect(logSpy).toHaveBeenCalledWith(
        '✔ if-check successfully verified mock-manifest.yaml\n'
      );
      expect(mockExecFileSync).toHaveBeenCalledTimes(3);
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        1,
        process.execPath,
        [...process.execArgv, '/path/to/if-env', '-m', manifestPath],
        {stdio: 'ignore'}
      );
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        2,
        process.execPath,
        [
          ...process.execArgv,
          '/path/to/if-run',
          '-m',
          manifestPath,
          '-o',
          executedManifest,
        ],
        {stdio: 'ignore'}
      );
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        3,
        process.execPath,
        [
          ...process.execArgv,
          '/path/to/if-diff',
          '-s',
          `${executedManifest}.yaml`,
          '-t',
          manifestPath,
        ],
        {stdio: 'inherit'}
      );
    });
  });
});
