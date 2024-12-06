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
        case 'if-check-cwd':
          expect(param).toEqual(
            "npm run if-env  -- -m ./src/__mocks__/mock-manifest.yaml -c && npm run if-run  -- -m ./src/__mocks__/mock-manifest.yaml -o src/__mocks__/re-mock-manifest &&  node -p 'Boolean(process.stdout.isTTY)' | npm run if-diff  -- -s src/__mocks__/re-mock-manifest.yaml -t ./src/__mocks__/mock-manifest.yaml"
          );
          break;
        case 'if-check-global':
          expect(param).toEqual(
            "if-env  -m ./src/__mocks__/mock-manifest.yaml && if-run  -m ./src/__mocks__/mock-manifest.yaml -o src/__mocks__/re-mock-manifest &&  node -p 'Boolean(process.stdout.isTTY)' | if-diff  -s src/__mocks__/re-mock-manifest.yaml -t ./src/__mocks__/mock-manifest.yaml"
          );
          break;
        case 'if-check-prefix':
          expect(param).toEqual(
            "if-env --prefix=.. -m ./src/__mocks__/mock-manifest.yaml && if-run --prefix=.. -m ./src/__mocks__/mock-manifest.yaml -o src/__mocks__/re-mock-manifest &&  node -p 'Boolean(process.stdout.isTTY)' | if-diff --prefix=.. -s src/__mocks__/re-mock-manifest.yaml -t ./src/__mocks__/mock-manifest.yaml"
          );
          break;
      }
      return;
    },
  };
});

import {executeCommands} from '../../../if-check/util/npm';

describe('if-check/util/npm: ', () => {
  describe('executeCommands(): ', () => {
    it('successfully executes with correct commands.', async () => {
      process.env.NPM_INSTALL = 'if-check';
      const manifest = './src/__mocks__/mock-manifest.yaml';
      const logSpy = jest.spyOn(global.console, 'log');

      await executeCommands(manifest, false);

      expect.assertions(6);
      expect(logSpy).toHaveBeenCalledWith(
        '✔ if-check successfully verified mock-manifest.yaml\n'
      );
    });

    it('successfully executes with cwd command.', async () => {
      process.env.NPM_INSTALL = 'if-check-cwd';
      const manifest = './src/__mocks__/mock-manifest.yaml';
      const logSpy = jest.spyOn(global.console, 'log');

      await executeCommands(manifest, true);

      expect.assertions(2);
      expect(logSpy).toHaveBeenCalledWith(
        '✔ if-check successfully verified mock-manifest.yaml\n'
      );
    });

    it('successfully executes with correct commands when is running from global.', async () => {
      process.env.npm_config_global = 'true';
      process.env.NPM_INSTALL = 'if-check-global';
      const manifest = './src/__mocks__/mock-manifest.yaml';
      const logSpy = jest.spyOn(global.console, 'log');

      await executeCommands(manifest, false);

      expect.assertions(2);
      expect(logSpy).toHaveBeenCalledWith(
        '✔ if-check successfully verified mock-manifest.yaml\n'
      );
    });

    it('successfully executes with correct commands when CURRENT_DIR is provided.', async () => {
      process.env.CURRENT_DIR = './mock-path';
      process.env.npm_config_global = 'true';
      process.env.NPM_INSTALL = 'if-check-prefix';
      const manifest = './src/__mocks__/mock-manifest.yaml';
      const logSpy = jest.spyOn(global.console, 'log');

      await executeCommands(manifest, false);

      expect.assertions(2);
      expect(logSpy).toHaveBeenCalledWith(
        '✔ if-check successfully verified mock-manifest.yaml\n'
      );
    });
  });
});
