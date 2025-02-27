jest.mock('fs/promises', () => require('../../../__mocks__/fs'));

const mockInfo = jest.fn();

jest.mock('node:readline/promises', () =>
  require('../../../__mocks__/readline')
);
jest.mock('../../../common/util/logger', () => ({
  logger: {
    info: mockInfo,
  },
}));

jest.mock('child_process', () => {
  const originalModule = jest.requireActual('child_process');
  return {
    ...originalModule,
    execFileSync: (file: any, args: any) => {
      switch (process.env.NPM_INSTALL) {
        case 'true':
          expect(file).toEqual('npm install @grnsft/if@0.3.3-beta.0');
          break;
        case 'npm init -y':
          expect(file).toEqual('npm init -y');
          break;
        case 'if-check':
          expect(
            [
              'npm run if-env -- -m ./src/__mocks__/mock-manifest.yaml',
              'npm run if-run -- -m ./src/__mocks__/mock-manifest.yaml -o src/__mocks__/re-mock-manifest',
              'node -p Boolean(process.stdout.isTTY)',
              'npm run if-diff -- -s src/__mocks__/re-mock-manifest.yaml -t ./src/__mocks__/mock-manifest.yaml',
            ].includes(
              Array.isArray(args) ? `${file} ${args.join(' ')}` : file.trim()
            )
          ).toBeTruthy();
          break;
        case 'if-check-prefix':
          expect(
            [
              'npm run if-env -- --prefix=.. -m ./src/__mocks__/mock-manifest.yaml',
              'npm run if-run -- --prefix=.. -m ./src/__mocks__/mock-manifest.yaml -o src/__mocks__/re-mock-manifest',
              'npm run if-diff -- --prefix=.. -s src/__mocks__/re-mock-manifest.yaml -t ./src/__mocks__/mock-manifest.yaml',
              'node -p Boolean(process.stdout.isTTY)',
            ].includes(
              Array.isArray(args) ? `${file} ${args.join(' ')}` : file.trim()
            )
          ).toBeTruthy();
          break;
        case 'if-check-global':
          expect(
            [
              'if-env  -m ./src/__mocks__/mock-manifest.yaml',
              'if-run  -m ./src/__mocks__/mock-manifest.yaml -o src/__mocks__/re-mock-manifest',
              'if-diff  -s src/__mocks__/re-mock-manifest.yaml -t ./src/__mocks__/mock-manifest.yaml',
              'node -p Boolean(process.stdout.isTTY)',
            ].includes(
              Array.isArray(args) ? `${file} ${args.join(' ')}` : file.trim()
            )
          ).toBeTruthy();

          break;
        case 'if-check-tty':
          expect(
            [
              'if-env  -m ./src/__mocks__/mock-manifest.yaml',
              'if-run  -m ./src/__mocks__/mock-manifest.yaml -o src/__mocks__/re-mock-manifest',
              'if-diff  -s src/__mocks__/re-mock-manifest.yaml -t ./src/__mocks__/mock-manifest.yaml',
              'tty | if-diff  -s src/__mocks__/re-mock-manifest.yaml -t ./src/__mocks__/mock-manifest.yaml',
              'node -p Boolean(process.stdout.isTTY)',
            ].includes(
              Array.isArray(args) ? `${file} ${args.join(' ')}` : file.trim()
            )
          ).toBeTruthy();

          break;
      }

      if (process.env.NPM_INSTALL === 'if-check-tty') {
        return true;
      }
      return;
    },
  };
});

import {executeCommands} from '../../../if-check/util/npm';

describe('if-check/util/npm: ', () => {
  const originalEnv = process.env;
  describe('executeCommands(): ', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('successfully executes with correct commands.', async () => {
      process.env.NPM_INSTALL = 'if-check';
      const manifest = './src/__mocks__/mock-manifest.yaml';
      const logSpy = jest.spyOn(global.console, 'log');

      await executeCommands(manifest);

      expect.assertions(6);
      expect(logSpy).toHaveBeenCalledWith(
        '✔ if-check successfully verified mock-manifest.yaml\n'
      );
    });

    it('successfully executes with prefix.', async () => {
      process.env.CURRENT_DIR = 'mock-dir';
      process.env.NPM_INSTALL = 'if-check-prefix';
      const manifest = './src/__mocks__/mock-manifest.yaml';
      const logSpy = jest.spyOn(global.console, 'log');

      await executeCommands(manifest);

      expect.assertions(6);
      expect(logSpy).toHaveBeenCalledWith(
        '✔ if-check successfully verified mock-manifest.yaml\n'
      );
      delete process.env.CURRENT_DIR;
    });

    it('successfully executes when it runs from the global.', async () => {
      process.env.NPM_INSTALL = 'if-check-global';
      process.env.npm_config_global = 'true';

      const manifest = './src/__mocks__/mock-manifest.yaml';
      const logSpy = jest.spyOn(global.console, 'log');

      await executeCommands(manifest);

      expect.assertions(6);
      expect(logSpy).toHaveBeenCalledWith(
        '✔ if-check successfully verified mock-manifest.yaml\n'
      );
    });

    it('successfully executes when the `tty` is true.', async () => {
      const originalIsTTY = process.stdin.isTTY;
      process.stdin.isTTY = true;
      process.env.NPM_INSTALL = 'if-check-tty';
      process.env.npm_config_global = 'true';

      const manifest = './src/__mocks__/mock-manifest.yaml';
      const logSpy = jest.spyOn(global.console, 'log');

      await executeCommands(manifest);

      expect.assertions(6);
      expect(logSpy).toHaveBeenCalledWith(
        '✔ if-check successfully verified mock-manifest.yaml\n'
      );

      process.stdin.isTTY = originalIsTTY;
    });
  });
});
