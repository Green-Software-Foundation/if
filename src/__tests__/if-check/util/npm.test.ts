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

jest.mock('../../../common/util/helpers', () => {
  const originalModule = jest.requireActual('../../../common/util/helpers');
  return {
    ...originalModule,
    execPromise: async (param: any) => {
      switch (process.env.NPM_INSTALL) {
        case 'true':
          expect(param).toEqual('npm install @grnsft/if@0.3.3-beta.0');
          break;
        case 'npm init -y':
          expect(param).toEqual('npm init -y');
          break;
        case 'if-check':
          expect(param).toEqual(
            "npm run if-env  -- -m ./src/__mocks__/mock-manifest.yaml && npm run if-run  -- -m ./src/__mocks__/mock-manifest.yaml -o src/__mocks__/re-mock-manifest &&  node -p 'Boolean(process.stdout.isTTY)' | npm run if-diff  -- -s src/__mocks__/re-mock-manifest.yaml -t ./src/__mocks__/mock-manifest.yaml"
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

      expect.assertions(2);
      expect(logSpy).toHaveBeenCalledWith(
        '✔ if-check successfully verified mock-manifest.yaml\n'
      );
    });
  });
});
